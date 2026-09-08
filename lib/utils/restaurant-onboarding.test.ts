import { describe, expect, it } from "vitest";
import {
  buildOnboardingSteps,
  countLiveMenuItems,
  countRunningPromotions,
  hasOrderableCateringHours,
  onboardingProgress,
  type OnboardingRestaurant,
  type OnboardingStep,
} from "./restaurant-onboarding";

const RESTAURANT_ID = "11111111-2222-3333-4444-555555555555";

/** A restaurant with nothing filled in — the state a new partner starts from. */
const emptyRestaurant: OnboardingRestaurant = {};

/** A restaurant that has done everything the checklist asks of it. */
const completeRestaurant: OnboardingRestaurant = {
  restaurant_description: "Neapolitan pizza, cooked in a wood oven.",
  contactNumber: "+44 7123 456789",
  orderNotificationEmails: ["orders@ziapina.co.uk"],
  logoImageUrl: "https://cdn.swift/logo.png",
  images: ["https://cdn.swift/banner.jpg"],
  cateringOperatingHours: [
    { day: "monday", open: "09:00", close: "17:00", enabled: true },
  ],
  categories: [{ id: "c1", name: "Italian" }],
  menuItems: [{ status: "ACTIVE" }],
};

const build = (
  restaurant: OnboardingRestaurant,
  overrides: { stripeComplete?: boolean; promotions?: { status?: string }[] } = {},
) =>
  buildOnboardingSteps({
    restaurantId: RESTAURANT_ID,
    restaurant,
    stripeComplete: overrides.stripeComplete ?? true,
    promotions: overrides.promotions ?? [],
  });

const step = (steps: OnboardingStep[], id: string) =>
  steps.find((s) => s.id === id)!;

const task = (steps: OnboardingStep[], id: string) =>
  step(steps, "settings").tasks.find((t) => t.id === id)!;

describe("catering hours", () => {
  it("needs a day that is switched on with both times, because that is what the order check needs", () => {
    expect(
      hasOrderableCateringHours([
        { day: "monday", open: "09:00", close: "17:00", enabled: true },
      ]),
    ).toBe(true);
  });

  it("treats every day switched off as no hours at all — this is the Swift Selection state, where no order can be placed", () => {
    expect(
      hasOrderableCateringHours([
        { day: "monday", open: "09:00", close: "17:00", enabled: false },
        { day: "tuesday", open: "09:00", close: "17:00", enabled: false },
      ]),
    ).toBe(false);
  });

  it("does not count a day that is on but has no times", () => {
    expect(
      hasOrderableCateringHours([
        { day: "monday", open: null, close: null, enabled: true },
      ]),
    ).toBe(false);
  });

  it("counts an empty or missing schedule as not set", () => {
    expect(hasOrderableCateringHours([])).toBe(false);
    expect(hasOrderableCateringHours(null)).toBe(false);
    expect(hasOrderableCateringHours(undefined)).toBe(false);
  });
});

describe("menu items", () => {
  it("counts only the statuses the catering menu will show a customer", () => {
    expect(
      countLiveMenuItems([
        { status: "ACTIVE" },
        { status: "CATERING" },
        { status: "DRAFT" },
        { status: "INACTIVE" },
        { status: "SOLD_OUT" },
      ]),
    ).toBe(2);
  });

  it("survives a missing or oddly-cased status", () => {
    expect(countLiveMenuItems([{ status: "active" }, {}, { status: null }])).toBe(1);
  });

  it("separates 'no menu' from 'menu saved but nothing live', which are different fixes", () => {
    const noMenu = step(build({ ...completeRestaurant, menuItems: [] }), "menu");
    expect(noMenu.done).toBe(false);
    expect(noMenu.detail).toMatch(/Add the food you cater/);

    const draftsOnly = step(
      build({ ...completeRestaurant, menuItems: [{ status: "DRAFT" }, { status: "DRAFT" }] }),
      "menu",
    );
    expect(draftsOnly.done).toBe(false);
    expect(draftsOnly.detail).toMatch(/2 items saved, but none are live/);
    expect(draftsOnly.actionLabel).toBe("Review your menu");
  });

  it("says one item, not 1 items", () => {
    const one = step(build({ ...completeRestaurant, menuItems: [{ status: "DRAFT" }] }), "menu");
    expect(one.detail).toMatch(/1 item saved/);
  });
});

describe("bundle discount", () => {
  it("is done once a discount is running or scheduled to start", () => {
    expect(countRunningPromotions([{ status: "ACTIVE" }])).toBe(1);
    expect(countRunningPromotions([{ status: "SCHEDULED" }])).toBe(1);
  });

  it("ignores discounts that have finished or been switched off", () => {
    expect(countRunningPromotions([{ status: "EXPIRED" }, { status: "INACTIVE" }])).toBe(0);
  });

  it("is optional, so it never holds the checklist open", () => {
    const steps = build(completeRestaurant, { promotions: [] });
    expect(step(steps, "discount").done).toBe(false);
    expect(step(steps, "discount").optional).toBe(true);
    expect(onboardingProgress(steps).allRequiredDone).toBe(true);
  });
});

describe("the checklist as a whole", () => {
  it("marks everything incomplete for a partner who has just signed up", () => {
    const steps = build(emptyRestaurant, { stripeComplete: false });
    expect(steps.filter((s) => s.done)).toHaveLength(0);
    expect(onboardingProgress(steps)).toEqual({
      completed: 0,
      total: 3,
      allRequiredDone: false,
    });
  });

  it("clears once the three required steps are done", () => {
    const steps = build(completeRestaurant, { stripeComplete: true });
    expect(onboardingProgress(steps)).toEqual({
      completed: 3,
      total: 3,
      allRequiredDone: true,
    });
  });

  it("names each missing field rather than just failing the step", () => {
    const steps = build({ ...completeRestaurant, contactNumber: "", logoImageUrl: null });
    const settings = step(steps, "settings");

    expect(settings.done).toBe(false);
    expect(settings.detail).toBe("2 still to fill in.");
    expect(settings.tasks.filter((t) => !t.done).map((t) => t.id)).toEqual([
      "contact-number",
      "logo",
    ]);
  });

  it("sends each missing field to the screen that fixes it", () => {
    const steps = build(emptyRestaurant);

    expect(task(steps, "catering-hours").href).toBe(
      `/restaurant/opening-hours/${RESTAURANT_ID}`,
    );
    expect(task(steps, "order-emails").href).toBe(
      `/restaurant/settings/${RESTAURANT_ID}?section=profile`,
    );
    expect(task(steps, "categories").href).toBe(
      `/restaurant/settings/${RESTAURANT_ID}?section=categories`,
    );
    expect(step(steps, "menu").href).toBe(`/restaurant/menu/${RESTAURANT_ID}`);
    expect(step(steps, "discount").href).toBe(`/restaurant/promotions/${RESTAURANT_ID}`);
  });

  it("does not accept whitespace as an answer", () => {
    const steps = build({
      ...completeRestaurant,
      restaurant_description: "   ",
      contactNumber: " ",
      orderNotificationEmails: ["  "],
      images: [""],
    });

    expect(step(steps, "settings").tasks.filter((t) => !t.done).map((t) => t.id)).toEqual([
      "order-emails",
      "contact-number",
      "description",
      "cover-photo",
    ]);
  });

  it("keeps Stripe's action on the dashboard, where the onboarding link already lives", () => {
    expect(step(build(emptyRestaurant, { stripeComplete: false }), "stripe").href).toBeNull();
  });

  it("treats an exempt restaurant's Stripe step as done, since the caller passes the verdict in", () => {
    expect(step(build(emptyRestaurant, { stripeComplete: true }), "stripe").done).toBe(true);
  });
});
