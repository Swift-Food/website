"use client";

import MultiStepRestaurantForm from "../components/restaurant_form";
import { mailService } from "../service/mail";

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <MultiStepRestaurantForm />
    </div>
  );
}
