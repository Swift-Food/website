/**
 * What a restaurant still has to fill in before it is genuinely open for
 * business, and where they go to fill it in.
 *
 * Every check here is tied to something that actually breaks when the field
 * is empty — an order that cannot be placed, an email nobody receives, a
 * blank space on the customer's card — rather than to "this column is null".
 * The rules the backend enforces are the reference:
 *
 *   - catering hours  → shared/utils/restaurant-availability.ts refuses an
 *                       order outright ('no_catering_hours' / 'closed_on_day')
 *   - order emails    → utils/mail/restaurant-recipients.util.ts skips the
 *                       send when the list is empty, so a new order arrives
 *                       silently
 *   - menu items      → catering-menu.service.ts only ever surfaces items
 *                       with status ACTIVE or CATERING
 *
 * Pure and side-effect free: it takes the restaurant record the dashboard has
 * already fetched and returns a verdict the page renders.
 */

export type OnboardingStepId = "stripe" | "settings" | "menu" | "discount";

/** A single thing to fill in, and where it gets filled in. */
export interface OnboardingTask {
  id: string;
  label: string;
  /** What goes wrong while this is empty. Shown to the restaurant. */
  consequence: string;
  done: boolean;
  href: string;
}

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  /** Optional steps never hold the checklist open. */
  optional: boolean;
  done: boolean;
  /** Where the step's own button goes. Null when the action lives on this page. */
  href: string | null;
  actionLabel: string;
  /** Set when the step is incomplete for a reason worth spelling out. */
  detail?: string;
  /** Only the settings step breaks down into individual fields. */
  tasks: OnboardingTask[];
}

export interface OnboardingCateringHours {
  day: string;
  open: string | null;
  close: string | null;
  enabled: boolean;
}

export interface OnboardingMenuItem {
  status?: string | null;
}

export interface OnboardingPromotion {
  status?: string | null;
}

/** The subset of the restaurant record the checklist reads. */
export interface OnboardingRestaurant {
  restaurant_description?: string | null;
  contactNumber?: string | null;
  orderNotificationEmails?: string[] | null;
  logoImageUrl?: string | null;
  images?: string[] | null;
  cateringOperatingHours?: OnboardingCateringHours[] | null;
  categories?: { id?: string; name?: string }[] | null;
  menuItems?: OnboardingMenuItem[] | null;
}

export interface OnboardingInput {
  restaurantId: string;
  restaurant: OnboardingRestaurant;
  /** From checkStripeStatus, or true for a restaurant Swift exempts. */
  stripeComplete: boolean;
  promotions: OnboardingPromotion[];
}

const filled = (value: string | null | undefined): boolean =>
  typeof value === "string" && value.trim().length > 0;

const anyFilled = (values: (string | null | undefined)[] | null | undefined): boolean =>
  Array.isArray(values) && values.some(filled);

/**
 * A day only counts if it is switched on AND has both times: the availability
 * check requires `enabled && open && close` before it will let an order
 * through, so a half-filled day is the same as a closed one.
 */
export const hasOrderableCateringHours = (
  hours: OnboardingCateringHours[] | null | undefined,
): boolean =>
  Array.isArray(hours) &&
  hours.some((h) => h?.enabled && filled(h?.open) && filled(h?.close));

/** Statuses the catering menu will actually show a customer. */
const LIVE_MENU_STATUSES = new Set(["ACTIVE", "CATERING"]);

export const countLiveMenuItems = (
  items: OnboardingMenuItem[] | null | undefined,
): number =>
  (items ?? []).filter((item) =>
    LIVE_MENU_STATUSES.has(String(item?.status ?? "").toUpperCase()),
  ).length;

/** Scheduled counts: the restaurant has done the work, it just starts later. */
const RUNNING_PROMOTION_STATUSES = new Set(["ACTIVE", "SCHEDULED"]);

export const countRunningPromotions = (
  promotions: OnboardingPromotion[] | null | undefined,
): number =>
  (promotions ?? []).filter((p) =>
    RUNNING_PROMOTION_STATUSES.has(String(p?.status ?? "").toUpperCase()),
  ).length;

const buildSettingsTasks = (
  restaurantId: string,
  restaurant: OnboardingRestaurant,
): OnboardingTask[] => {
  const profile = `/restaurant/settings/${restaurantId}?section=profile`;

  return [
    {
      id: "catering-hours",
      label: "Catering opening hours",
      consequence:
        "Until at least one day is switched on with an open and close time, we have to turn away every order.",
      done: hasOrderableCateringHours(restaurant.cateringOperatingHours),
      href: `/restaurant/opening-hours/${restaurantId}`,
    },
    {
      id: "order-emails",
      label: "Order notification email",
      consequence:
        "New orders, refunds and driver updates are emailed here. With no address saved, nothing is sent.",
      done: anyFilled(restaurant.orderNotificationEmails),
      href: profile,
    },
    {
      id: "contact-number",
      label: "Contact number",
      consequence:
        "How we and the driver reach the kitchen on the day of an order.",
      done: filled(restaurant.contactNumber),
      href: profile,
    },
    {
      id: "description",
      label: "Description",
      consequence: "Customers read this when they browse you.",
      done: filled(restaurant.restaurant_description),
      href: profile,
    },
    {
      id: "cover-photo",
      label: "Cover photo",
      consequence:
        "The banner on your card. Without one it shows a grey box with your initial.",
      done: anyFilled(restaurant.images),
      href: profile,
    },
    {
      id: "logo",
      label: "Logo",
      consequence: "Shown as the round badge on your card.",
      done: filled(restaurant.logoImageUrl),
      href: profile,
    },
    {
      id: "categories",
      label: "Categories",
      consequence: "How customers filter down to restaurants like yours.",
      done: (restaurant.categories ?? []).length > 0,
      href: `/restaurant/settings/${restaurantId}?section=categories`,
    },
  ];
};

const describeMenu = (total: number, live: number): string | undefined => {
  if (live > 0) return undefined;
  if (total > 0) {
    // Worth separating: they have done the typing, the items are just not
    // switched on, which is a very different fix from "add your food".
    return `You have ${total} item${total === 1 ? "" : "s"} saved, but none are live. Set them to Active so customers can order them.`;
  }
  return "Add the food you cater, with prices and how many people each portion feeds.";
};

export const buildOnboardingSteps = ({
  restaurantId,
  restaurant,
  stripeComplete,
  promotions,
}: OnboardingInput): OnboardingStep[] => {
  const settingsTasks = buildSettingsTasks(restaurantId, restaurant);
  const outstanding = settingsTasks.filter((t) => !t.done);

  const totalMenuItems = (restaurant.menuItems ?? []).length;
  const liveMenuItems = countLiveMenuItems(restaurant.menuItems);
  const runningPromotions = countRunningPromotions(promotions);

  return [
    {
      id: "stripe",
      title: "Stripe onboarding",
      description: "Verify your business so Swift can pay you.",
      optional: false,
      done: stripeComplete,
      href: null,
      actionLabel: "Complete Stripe onboarding",
      detail: stripeComplete
        ? undefined
        : "We cannot release your earnings until Stripe has verified your details.",
      tasks: [],
    },
    {
      id: "settings",
      title: "Restaurant settings",
      description: "Your hours, contact details and how your card looks.",
      optional: false,
      done: outstanding.length === 0,
      href: `/restaurant/settings/${restaurantId}`,
      actionLabel: "Open settings",
      detail:
        outstanding.length === 0
          ? undefined
          : `${outstanding.length} still to fill in.`,
      tasks: settingsTasks,
    },
    {
      id: "menu",
      title: "Menu management",
      description: "The dishes customers order from.",
      optional: false,
      done: liveMenuItems > 0,
      href: `/restaurant/menu/${restaurantId}`,
      actionLabel: totalMenuItems > 0 ? "Review your menu" : "Add your first dish",
      detail: describeMenu(totalMenuItems, liveMenuItems),
      tasks: [],
    },
    {
      id: "discount",
      title: "Bundle discount",
      // "Bundle discount" is the partner-facing name for what Promotions
      // calls Buy More Save More: a percentage off once the order is big
      // enough. The row carries an Optional badge, so the wording does not
      // need to repeat it.
      description:
        "Reward bigger orders — a percentage off once a customer passes a quantity or a spend.",
      optional: true,
      done: runningPromotions > 0,
      href: `/restaurant/promotions/${restaurantId}`,
      actionLabel: runningPromotions > 0 ? "Manage discounts" : "Set up a discount",
      detail:
        runningPromotions > 0
          ? undefined
          : "Skip this if you would rather not discount — it will not hold anything up.",
      tasks: [],
    },
  ];
};

export interface OnboardingProgress {
  completed: number;
  total: number;
  /** Every required step done — the checklist has nothing left to say. */
  allRequiredDone: boolean;
}

export const onboardingProgress = (steps: OnboardingStep[]): OnboardingProgress => {
  const required = steps.filter((s) => !s.optional);
  const completed = required.filter((s) => s.done).length;
  return {
    completed,
    total: required.length,
    allRequiredDone: completed === required.length,
  };
};
