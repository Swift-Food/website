import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  shouldShowAuthPrompt,
  hasSeenAuthPrompt,
  markAuthPromptSeen,
} from "./auth-prompt";
import { CUSTOMER_AUTH_PROMPT_KEY } from "@/lib/api-client/storage-keys";

function installLocalStorage() {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
  };
  return store;
}

function installThrowingLocalStorage() {
  (globalThis as any).localStorage = {
    getItem: () => {
      throw new DOMException("denied");
    },
    setItem: () => {
      throw new DOMException("denied");
    },
    removeItem: () => {},
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("shouldShowAuthPrompt", () => {
  it("prompts a signed-out first-time visitor", () => {
    expect(
      shouldShowAuthPrompt({ loading: false, isAuthenticated: false, seen: false }),
    ).toBe(true);
  });

  it("stays quiet while the session is still restoring", () => {
    // Otherwise a signed-in customer sees the modal flash before it vanishes.
    expect(
      shouldShowAuthPrompt({ loading: true, isAuthenticated: false, seen: false }),
    ).toBe(false);
  });

  it("never prompts someone already signed in", () => {
    expect(
      shouldShowAuthPrompt({ loading: false, isAuthenticated: true, seen: false }),
    ).toBe(false);
  });

  it("never prompts twice on the same device", () => {
    expect(
      shouldShowAuthPrompt({ loading: false, isAuthenticated: false, seen: true }),
    ).toBe(false);
  });
});

describe("auth prompt persistence", () => {
  it("remembers the prompt once it has been answered", () => {
    const store = installLocalStorage();

    expect(hasSeenAuthPrompt()).toBe(false);
    markAuthPromptSeen();

    expect(store.get(CUSTOMER_AUTH_PROMPT_KEY)).toBe("1");
    expect(hasSeenAuthPrompt()).toBe(true);
  });

  it("treats unreadable storage as not yet seen rather than throwing", () => {
    // Safari private mode throws on access; the order page must still render.
    installThrowingLocalStorage();

    expect(() => hasSeenAuthPrompt()).not.toThrow();
    expect(hasSeenAuthPrompt()).toBe(false);
  });

  it("survives storage that refuses writes", () => {
    installThrowingLocalStorage();
    expect(() => markAuthPromptSeen()).not.toThrow();
  });
});
