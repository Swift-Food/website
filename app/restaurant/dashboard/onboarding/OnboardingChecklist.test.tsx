import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildOnboardingSteps,
  type OnboardingRestaurant,
} from "@/lib/utils/restaurant-onboarding";

// The checklist is rendered on the server here, with no router around it.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...rest }, children),
}));

const { OnboardingChecklist } = await import("./OnboardingChecklist");

const RESTAURANT_ID = "abc";

const readyRestaurant: OnboardingRestaurant = {
  restaurant_description: "Bagels, baked overnight.",
  contactNumber: "+44 20 7000 0000",
  orderNotificationEmails: ["orders@example.com"],
  images: ["banner.jpg"],
  logoImageUrl: "logo.png",
  cateringOperatingHours: [
    { day: "monday", open: "09:00", close: "17:00", enabled: true },
  ],
  categories: [{ id: "c", name: "Bakery" }],
  menuItems: [{ status: "ACTIVE" }],
};

const render = (
  restaurant: OnboardingRestaurant,
  options: { stripeComplete?: boolean } = {},
) =>
  renderToStaticMarkup(
    React.createElement(OnboardingChecklist, {
      steps: buildOnboardingSteps({
        restaurantId: RESTAURANT_ID,
        restaurant,
        stripeComplete: options.stripeComplete ?? true,
        promotions: [],
      }),
      stripeAnchorId: "stripe-onboarding",
      onOpenSettings: () => {},
    }),
  );

describe("the setup checklist on the dashboard", () => {
  it("says nothing to a restaurant that is already set up", () => {
    // The optional discount step is deliberately not enough to keep it open.
    expect(render(readyRestaurant)).toBe("");
  });

  it("names every field a brand new partner still has to fill in", () => {
    const html = render({}, { stripeComplete: false });

    expect(html).toContain("0 of 3 done");
    for (const label of [
      "Catering opening hours",
      "Order notification email",
      "Contact number",
      "Description",
      "Cover photo",
      "Logo",
      "Categories",
    ]) {
      expect(html).toContain(label);
    }
  });

  it("lists only what is actually missing", () => {
    const html = render({ ...readyRestaurant, logoImageUrl: "" });

    expect(html).toContain("2 of 3 done");
    expect(html).toContain("1 still to fill in.");
    expect(html).toContain("Logo");
    expect(html).not.toContain("Contact number");
  });

  it("sends the partner to the screen that fixes the field", () => {
    const html = render({ ...readyRestaurant, cateringOperatingHours: [] });

    expect(html).toContain(`href="/restaurant/opening-hours/${RESTAURANT_ID}"`);
    expect(html).toContain("we have to turn away every order");
  });

  it("points the Stripe row at the onboarding block already on the page", () => {
    expect(render(readyRestaurant, { stripeComplete: false })).toContain(
      'href="#stripe-onboarding"',
    );
  });

  it("marks each row for a screen reader, not just with a colour", () => {
    const html = render({ ...readyRestaurant, logoImageUrl: "" });

    expect(html).toContain("completed");
    expect(html).toContain("not completed");
  });
});
