import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createAuthClient,
  createFetchWithAuth,
  API_BASE_URL,
  type AuthStorageKeys,
} from "./auth-client";

const REST: AuthStorageKeys = {
  accessToken: "rest_access_token",
  refreshToken: "rest_refresh_token",
  user: "rest_user",
};
const PARTNER: AuthStorageKeys = {
  accessToken: "cw_access_token",
  refreshToken: "cw_refresh_token",
  user: "cw_user",
};

function installLocalStorage() {
  const store = new Map<string, string>();
  const mock = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
  };
  (globalThis as any).localStorage = mock;
  return store;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("createFetchWithAuth", () => {
  it("attaches a Bearer header from the configured access-token key", async () => {
    const store = installLocalStorage();
    store.set(REST.accessToken, "rest-abc");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuth = createFetchWithAuth(REST);
    await fetchWithAuth(`${API_BASE_URL}/restaurant/thing`);

    const [, opts] = fetchMock.mock.calls[0];
    expect((opts.headers as any).Authorization).toBe("Bearer rest-abc");
  });

  it("refreshes with the configured refresh key and writes new tokens back to the configured keys", async () => {
    const store = installLocalStorage();
    store.set(PARTNER.accessToken, "cw-old");
    store.set(PARTNER.refreshToken, "cw-refresh");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: "cw-new", refresh_token: "cw-new-refresh" }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuthPartner = createFetchWithAuth(PARTNER);
    const res = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/x/info`);

    expect(res.status).toBe(200);
    // refresh call used the partner refresh token
    const refreshCall = fetchMock.mock.calls[1];
    expect(refreshCall[0]).toBe(`${API_BASE_URL}/auth/refresh`);
    expect(JSON.parse(refreshCall[1].body)).toEqual({ refresh_token: "cw-refresh" });
    // new tokens stored under partner keys
    expect(store.get(PARTNER.accessToken)).toBe("cw-new");
    expect(store.get(PARTNER.refreshToken)).toBe("cw-new-refresh");
  });

  it("keeps the two instances isolated: a partner refresh never touches restaurant keys", async () => {
    const store = installLocalStorage();
    store.set(REST.accessToken, "rest-keep");
    store.set(REST.refreshToken, "rest-keep-refresh");
    store.set(PARTNER.accessToken, "cw-old");
    store.set(PARTNER.refreshToken, "cw-refresh");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: "cw-new", refresh_token: "cw-new-refresh" }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuthPartner = createFetchWithAuth(PARTNER);
    await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/x/info`);

    expect(store.get(REST.accessToken)).toBe("rest-keep");
    expect(store.get(REST.refreshToken)).toBe("rest-keep-refresh");
  });

  it("clears only its own key set when there is no refresh token on 401", async () => {
    const store = installLocalStorage();
    store.set(REST.accessToken, "rest-keep");
    store.set(PARTNER.accessToken, "cw-stale");
    store.set(PARTNER.user, "{}");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuthPartner = createFetchWithAuth(PARTNER);
    await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/x/info`);

    expect(store.has(PARTNER.accessToken)).toBe(false);
    expect(store.has(PARTNER.user)).toBe(false);
    expect(store.get(REST.accessToken)).toBe("rest-keep");
  });
});


const CUSTOMER: AuthStorageKeys = {
  accessToken: "cust_access_token",
  refreshToken: "cust_refresh_token",
  user: "cust_user",
};

/** A JWT whose only meaningful claim is `exp`, seconds from now. */
function tokenExpiringIn(seconds: number): string {
  const payload = { exp: Math.floor(Date.now() / 1000) + seconds };
  const encode = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode({ alg: "HS256" })}.${encode(payload)}.sig`;
}

describe("ensureFreshToken", () => {
  it("returns null when nobody is signed in", async () => {
    installLocalStorage();
    const fetchMock = vi.fn();
    (globalThis as any).fetch = fetchMock;

    const { ensureFreshToken } = createAuthClient(CUSTOMER);

    expect(await ensureFreshToken()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a still-valid token without any network call", async () => {
    const store = installLocalStorage();
    const token = tokenExpiringIn(600);
    store.set(CUSTOMER.accessToken, token);
    store.set(CUSTOMER.refreshToken, "refresh-1");
    const fetchMock = vi.fn();
    (globalThis as any).fetch = fetchMock;

    const { ensureFreshToken } = createAuthClient(CUSTOMER);

    expect(await ensureFreshToken()).toBe(token);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes a token that is within the expiry skew", async () => {
    const store = installLocalStorage();
    store.set(CUSTOMER.accessToken, tokenExpiringIn(30));
    store.set(CUSTOMER.refreshToken, "refresh-1");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ access_token: "fresh-abc", refresh_token: "refresh-2" }),
        { status: 200 }
      )
    );
    (globalThis as any).fetch = fetchMock;

    const { ensureFreshToken } = createAuthClient(CUSTOMER);

    expect(await ensureFreshToken()).toBe("fresh-abc");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.get(CUSTOMER.accessToken)).toBe("fresh-abc");
    expect(store.get(CUSTOMER.refreshToken)).toBe("refresh-2");
  });

  it("refreshes an already-expired token", async () => {
    const store = installLocalStorage();
    store.set(CUSTOMER.accessToken, tokenExpiringIn(-3600));
    store.set(CUSTOMER.refreshToken, "refresh-1");
    (globalThis as any).fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ access_token: "fresh-abc", refresh_token: "refresh-2" }),
        { status: 200 }
      )
    );

    const { ensureFreshToken } = createAuthClient(CUSTOMER);

    expect(await ensureFreshToken()).toBe("fresh-abc");
  });

  it("refreshes a token it cannot read an expiry from", async () => {
    const store = installLocalStorage();
    store.set(CUSTOMER.accessToken, "not-a-jwt");
    store.set(CUSTOMER.refreshToken, "refresh-1");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ access_token: "fresh-abc", refresh_token: "refresh-2" }),
        { status: 200 }
      )
    );
    (globalThis as any).fetch = fetchMock;

    const { ensureFreshToken } = createAuthClient(CUSTOMER);

    expect(await ensureFreshToken()).toBe("fresh-abc");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares one refresh between concurrent callers", async () => {
    const store = installLocalStorage();
    store.set(CUSTOMER.accessToken, tokenExpiringIn(-10));
    store.set(CUSTOMER.refreshToken, "refresh-1");
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(
                  JSON.stringify({
                    access_token: "fresh-abc",
                    refresh_token: "refresh-2",
                  }),
                  { status: 200 }
                )
              ),
            5
          )
        )
    );
    (globalThis as any).fetch = fetchMock;

    const { ensureFreshToken } = createAuthClient(CUSTOMER);
    const [a, b] = await Promise.all([ensureFreshToken(), ensureFreshToken()]);

    expect(a).toBe("fresh-abc");
    expect(b).toBe("fresh-abc");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("clears the session and returns null when the refresh is rejected", async () => {
    const store = installLocalStorage();
    store.set(CUSTOMER.accessToken, tokenExpiringIn(-10));
    store.set(CUSTOMER.refreshToken, "refresh-1");
    store.set(CUSTOMER.user, '{"id":"u1"}');
    (globalThis as any).fetch = vi
      .fn()
      .mockResolvedValue(new Response("nope", { status: 401 }));

    const { ensureFreshToken } = createAuthClient(CUSTOMER);

    expect(await ensureFreshToken()).toBeNull();
    expect(store.get(CUSTOMER.accessToken)).toBeUndefined();
    expect(store.get(CUSTOMER.refreshToken)).toBeUndefined();
    expect(store.get(CUSTOMER.user)).toBeUndefined();
  });

  it("keeps createFetchWithAuth working unchanged", async () => {
    const store = installLocalStorage();
    store.set(REST.accessToken, "rest-abc");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200 }));
    (globalThis as any).fetch = fetchMock;

    await createFetchWithAuth(REST)(`${API_BASE_URL}/restaurant/thing`);

    const [, opts] = fetchMock.mock.calls[0];
    expect((opts.headers as any).Authorization).toBe("Bearer rest-abc");
  });
});
