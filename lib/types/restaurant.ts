/**
 * Restaurant Form Types
 * Type definitions for restaurant registration form
 */

export interface TRestaurantForm {
  // Basic Business Info
  restaurantName: string;
  ownerName: string;
  businessEmail: string;
  businessPhone: string;

  // Location Info
  streetAddress: string;
  city: string;
  postalCode: string;
  market: string;

  // Restaurant Profile
  cuisineTypes: string[];
  serviceTypes: string[];
  restaurantDescription: string;
}
