import { fetchWithAuth } from "@/lib/api-client/auth-client";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import type {
  ReviewableOrder,
  SubmitReviewPayload,
} from "@/types/review.types";

class ReviewService {
  private readErrorMessage = async (response: Response): Promise<string> => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => ({}));
      return body?.message || body?.error || "";
    }

    return (await response.text().catch(() => "")).trim();
  };

  async getReviewableOrder(token: string): Promise<ReviewableOrder> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${API_ENDPOINTS.ORDER_REVIEW_VIEW(token)}`
    );

    if (!response.ok) {
      const message = await this.readErrorMessage(response);
      throw new Error(message || "Failed to load review details");
    }

    return response.json();
  }

  async submitReview(
    token: string,
    payload: SubmitReviewPayload
  ): Promise<ReviewableOrder> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${API_ENDPOINTS.ORDER_REVIEW_VIEW(token)}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const message = await this.readErrorMessage(response);
      throw new Error(message || "Failed to submit review");
    }

    return response.json();
  }
}

export const reviewService = new ReviewService();
