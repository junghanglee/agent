import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ValueCards } from "@/components/landing/value-cards"
import { PurposeSection } from "@/components/landing/purpose-section"
import { FeaturedAgents } from "@/components/landing/featured-agents"
import { TokenSection } from "@/components/landing/token-section"
import { CommunityPreview } from "@/components/landing/community-preview"

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Header />
      <HeroSection />
      <ValueCards />
      <PurposeSection />
      <FeaturedAgents />
      <TokenSection />
      <CommunityPreview />
      <Footer />
    </main>
  )
}
