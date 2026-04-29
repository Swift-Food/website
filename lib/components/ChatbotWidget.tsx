"use client";

import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from "react";

type Sender = "bot" | "user";
type Status = "collecting" | "complete" | "no_match";

interface Message {
  id: string;
  sender: Sender;
  text: string;
}

interface ChatResponse {
  sessionId: string;
  status: Status;
  message: string;
  collectedFields: string[];
  recommendation?: unknown;
}

const STORAGE_KEY = "swift-food-chat-session";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to newest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Focus the input when the panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Bootstrap session on first open: reuse stored session or create new one
  useEffect(() => {
    if (!open || sessionIdRef.current || bootstrapping) return;

    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

    if (stored) {
      sessionIdRef.current = stored;
      void resumeSession(stored);
      return;
    }

    void createSession();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createSession() {
    setBootstrapping(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/catering-chat/session`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatResponse = await res.json();
      sessionIdRef.current = data.sessionId;
      window.localStorage.setItem(STORAGE_KEY, data.sessionId);
      setMessages([{ id: data.sessionId, sender: "bot", text: data.message }]);
    } catch (e) {
      setError("Couldn't start the chat. Please try again in a moment.");
    } finally {
      setBootstrapping(false);
    }
  }

  async function resumeSession(sid: string) {
    setBootstrapping(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/catering-chat/${sid}`);
      if (res.status === 404) {
        // Stale session — drop it and create a fresh one
        window.localStorage.removeItem(STORAGE_KEY);
        sessionIdRef.current = null;
        await createSession();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatResponse = await res.json();
      setMessages([{ id: data.sessionId, sender: "bot", text: data.message }]);
    } catch (e) {
      setError("Couldn't reconnect to the chat. Please try again.");
    } finally {
      setBootstrapping(false);
    }
  }

  async function sendMessage(text: string) {
    const sid = sessionIdRef.current;
    if (!sid || !text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/catering-chat/${sid}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (res.status === 409) {
        // Pessimistic session lock collision — another tab/click is in flight.
        throw new Error(
          "Just a moment — your last message is still being processed.",
        );
      }
      if (res.status === 503) {
        // Backend now produces a friendlier message that may include
        // Google's retry-after hint (e.g. "try again in about 21s").
        // Surface whatever it sent verbatim instead of a hardcoded fallback.
        let backendMessage: string | undefined;
        try {
          const body = await res.json();
          backendMessage =
            typeof body?.message === "string" ? body.message : undefined;
        } catch {
          // body wasn't JSON — fall through to default
        }
        throw new Error(
          backendMessage ??
            "Our AI is having a busy moment — give it 20–30 seconds and try again.",
        );
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ChatResponse = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: "bot", text: data.message },
      ]);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!sending) void sendMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) void sendMessage(input);
    }
  }

  function startFresh() {
    window.localStorage.removeItem(STORAGE_KEY);
    sessionIdRef.current = null;
    setMessages([]);
    setError(null);
    void createSession();
  }

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#fa43ad" }}
        >
          <ChatIcon className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col bg-white shadow-2xl overflow-hidden
            inset-0 sm:inset-auto sm:bottom-6 sm:right-6
            sm:w-[380px] sm:h-[580px] sm:max-h-[80vh] sm:rounded-2xl
            border border-gray-200"
          role="dialog"
          aria-label="Swift Food chat"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: "#fa43ad" }}
          >
            <div className="flex items-center gap-2">
              <ChatIcon className="w-5 h-5" />
              <div>
                <div className="font-semibold leading-tight">
                  Swift Food Helper
                </div>
                <div className="text-xs opacity-90 leading-tight">
                  Ask about catering or build a menu
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={startFresh}
                aria-label="Start a new chat"
                className="p-1.5 rounded hover:bg-white/20 transition-colors"
                title="Start a new chat"
              >
                <RefreshIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="p-1.5 rounded hover:bg-white/20 transition-colors"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {bootstrapping && messages.length === 0 && (
              <div className="text-center text-sm text-gray-500 mt-6">
                Connecting…
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} sender={m.sender} text={m.text} />
            ))}
            {sending && <TypingIndicator />}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white px-3 py-2 flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              rows={1}
              disabled={sending || bootstrapping || !sessionIdRef.current}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-100
                max-h-32"
              style={{ minHeight: "40px" }}
            />
            <button
              type="submit"
              disabled={
                sending || bootstrapping || !input.trim() || !sessionIdRef.current
              }
              aria-label="Send message"
              className="flex items-center justify-center w-10 h-10 rounded-lg text-white
                disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: "#fa43ad" }}
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({ sender, text }: { sender: Sender; text: string }) {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
          isUser
            ? "text-white rounded-br-sm"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
        }`}
        style={isUser ? { backgroundColor: "#fa43ad" } : undefined}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
