import { describe, it, expect, vi, beforeEach } from "vitest";
import { cateringService } from "./catering.api";

beforeEach(() => {
  vi.restoreAllMocks();
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  } as unknown as Storage;
});

describe("cateringService.updateCutlery", () => {
  it("PATCHes the cutlery endpoint with the access token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    globalThis.fetch = fetchMock as any;

    await cateringService.updateCutlery({
      orderId: "o1",
      sessionId: "s1",
      restaurantId: "r1",
      cutleryRequired: true,
      accessToken: "tok",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/catering-orders/cutlery");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toMatchObject({
      orderId: "o1",
      sessionId: "s1",
      restaurantId: "r1",
      cutleryRequired: true,
      accessToken: "tok",
    });
  });

  it("throws with the server error message when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Cannot change within 48 hours of event." }),
    });
    globalThis.fetch = fetchMock as any;

    await expect(
      cateringService.updateCutlery({
        orderId: "o1",
        sessionId: "s1",
        restaurantId: "r1",
        cutleryRequired: false,
        accessToken: "tok",
      })
    ).rejects.toThrow("Cannot change within 48 hours of event.");
  });
});
