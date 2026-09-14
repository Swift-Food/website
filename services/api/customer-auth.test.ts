import { describe, it, expect, vi, beforeEach } from "vitest";
import { customerAuthApi, isEmailTaken, AuthRequestError } from "./customer-auth.api";
import { API_BASE_URL } from "@/lib/api-client/auth-client";

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  (globalThis as any).fetch = fetchMock;
  return fetchMock;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("registerConsumer", () => {
  it("posts the chosen credentials to the signup route", async () => {
    const fetchMock = mockFetch(json({ success: true }));

    await customerAuthApi.registerConsumer("Ada@Example.com", "Ada", "hunter2");

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/auth/register-consumer`);
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({
      email: "Ada@Example.com",
      username: "Ada",
      password: "hunter2",
    });
  });

  it("surfaces a taken email as a 409 the form can branch on", async () => {
    mockFetch(json({ message: "User with this email already exists" }, 409));

    const err = await customerAuthApi
      .registerConsumer("ada@example.com", "Ada", "hunter2")
      .catch((e) => e);

    expect(err).toBeInstanceOf(AuthRequestError);
    expect(isEmailTaken(err)).toBe(true);
    expect(err.message).toBe("User with this email already exists");
  });

  it("does not mistake other failures for a taken email", async () => {
    mockFetch(json({ message: "Too many requests" }, 429));

    const err = await customerAuthApi
      .registerConsumer("ada@example.com", "Ada", "hunter2")
      .catch((e) => e);

    expect(isEmailTaken(err)).toBe(false);
    expect(err.status).toBe(429);
  });

  it("falls back to a readable message when the body carries none", async () => {
    mockFetch(new Response("", { status: 500 }));

    const err = await customerAuthApi
      .registerConsumer("ada@example.com", "Ada", "hunter2")
      .catch((e) => e);

    expect(err.message).toBe("Could not create your account. Please try again.");
  });
});

describe("resendVerification", () => {
  it("posts just the email", async () => {
    const fetchMock = mockFetch(json({ success: true, message: "sent" }));

    await customerAuthApi.resendVerification("ada@example.com");

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/auth/register-consumer/resend`);
    expect(JSON.parse(opts.body)).toEqual({ email: "ada@example.com" });
  });
});

describe("verifyEmail", () => {
  it("returns the token pair, since verifying also signs the customer in", async () => {
    const tokens = { access_token: "a", refresh_token: "r", expires_in: 900 };
    const fetchMock = mockFetch(json(tokens));

    const result = await customerAuthApi.verifyEmail("ada@example.com", "123456");

    expect(result).toEqual(tokens);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/auth/verify-email`);
    expect(JSON.parse(opts.body)).toEqual({ email: "ada@example.com", code: "123456" });
  });

  it("reports an expired code without pretending the email was taken", async () => {
    mockFetch(json({ message: "Verification code expired" }, 400));

    const err = await customerAuthApi.verifyEmail("ada@example.com", "123456").catch((e) => e);

    expect(isEmailTaken(err)).toBe(false);
    expect(err.message).toBe("Verification code expired");
  });
});
