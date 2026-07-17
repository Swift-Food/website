import { describe, it, expect, vi, beforeEach } from "vitest";
import {
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
