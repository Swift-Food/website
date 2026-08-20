import { describe, it, expect, vi, beforeEach } from "vitest";
import { reviewService } from "./review.api";

describe("reviewService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    } as unknown as Storage;
  });

  it("fetches the reviewable order for a token", async () => {
    const payload = { orderId: "order-1", restaurants: [] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
      headers: new Headers(),
      status: 200,
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await reviewService.getReviewableOrder("tok-1");

    expect(result).toEqual(payload);
    expect(fetchMock.mock.calls[0][0]).toContain("/order-reviews/view/tok-1");
  });

  it("throws the server message when submission fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Order not completed" }),
    }) as unknown as typeof fetch;

    await expect(
      reviewService.submitReview("tok-1", {
        orderScore: 5,
        restaurants: [],
        items: [],
      })
    ).rejects.toThrow("Order not completed");
  });
});
