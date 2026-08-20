export interface ReviewableItem {
  menuItemId: string;
  menuItemName: string;
  menuItemImage?: string;
}

export interface ReviewableRestaurant {
  restaurantId: string;
  restaurantName: string;
  mealSessionId: string | null;
  items: ReviewableItem[];
}

export interface ExistingRestaurantReview {
  restaurantId: string;
  score: number;
  comment: string | null;
}

export interface ExistingItemReview {
  menuItemId: string;
  score: number;
  comment: string | null;
}

export interface ExistingReview {
  orderScore: number | null;
  orderComment: string | null;
  restaurants: ExistingRestaurantReview[];
  items: ExistingItemReview[];
}

export interface ReviewableOrder {
  orderId: string;
  orderReference: string | null;
  status: string;
  alreadySubmitted: boolean;
  editableUntil: string | null;
  canEdit: boolean;
  restaurants: ReviewableRestaurant[];
  existing: ExistingReview | null;
}

export interface SubmitReviewPayload {
  orderScore: number;
  orderComment?: string;
  restaurants: {
    restaurantId: string;
    mealSessionId?: string;
    score: number;
    comment?: string;
  }[];
  items: {
    menuItemId: string;
    mealSessionId?: string;
    score: number;
    comment?: string;
  }[];
}

/** Client-side draft persisted to sessionStorage between steps. */
export interface ReviewDraft {
  step: number;
  orderScore: number | null;
  orderComment: string;
  restaurantScores: Record<string, number>;
  restaurantComments: Record<string, string>;
  itemScores: Record<string, number>;
}
