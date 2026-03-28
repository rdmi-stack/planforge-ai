import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { LogosBar } from "@/components/landing/logos-bar"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ComparisonSection } from "@/components/landing/comparison-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FinalCta } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <LogosBar />
      <FeaturesSection />
      <HowItWorksSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCta />
      <Footer />
    </main>
  )
}
