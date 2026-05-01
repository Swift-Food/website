"use client";

import { usePathname } from "next/navigation";
import ChatbotWidget from "@/lib/components/ChatbotWidget";

/**
 * Mounts the floating chatbot widget on every public route except
 * /catering-AI, where the chat is the page itself and a second
 * floating instance would show two threads at once.
 */
export default function FloatingChatbotMount() {
  const pathname = usePathname();
  if (pathname === "/catering-AI") return null;
  return <ChatbotWidget />;
}
