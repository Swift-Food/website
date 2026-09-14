/**
 * A `?next=` destination is attacker-supplied: it reaches us in a link anyone
 * can send. Only same-site paths are allowed through, so a crafted link cannot
 * bounce a customer to another origin straight after they sign in.
 *
 * Returns null for anything that is not a plain path, leaving the caller to
 * fall back to its own default.
 */
export const safeNextPath = (next: string | null | undefined): string | null => {
  if (!next) return null;

  const trimmed = next.trim();
  // "//evil.com" and "/\evil.com" are protocol-relative: the browser reads
  // them as another origin even though they start with a slash.
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return null;
  // A scheme can still hide behind an encoded or backslash-separated prefix.
  if (/^\/[^/]*:/.test(trimmed)) return null;

  return trimmed;
};
