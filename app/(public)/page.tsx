"use client";

import HeroSection from "@/lib/components/containers/HeroSection";
import SocialProofSection from "@/lib/components/containers/SocialProofSection";
import EventGallerySection from "@/lib/components/containers/EventGallerySection";
import FeatureDemosSection from "@/lib/components/containers/FeatureDemosSection";

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-pink-100">
      <main>
        <HeroSection />
        <SocialProofSection />
        <EventGallerySection />
        <FeatureDemosSection />
      </main>
    </div>
  );
}
