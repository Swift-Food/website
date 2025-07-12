export type TRestaurantForm = {
  restaurantName: string;
  ownerName: string;
  businessEmail: string;
  businessPhone: string;

  streetAddress: string;
  city: string;
  postalCode: string;
  market: string;

  cuisineTypes: string[];
  serviceTypes: string[];
  restaurantDescription: string;
};
