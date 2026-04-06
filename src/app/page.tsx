import Navbar from "@/components/homepage/Navbar";
import HeroSection from "@/components/homepage/HeroSection";
import LogoCloud from "@/components/homepage/LogoCloud";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import PricingSection from "@/components/homepage/PricingSection";
import CTASection from "@/components/homepage/CTASection";
import Footer from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="relative bg-black text-white overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="absolute -top-50 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-indigo-500/15 blur-[80px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] -left-25 w-150 h-150 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none -z-10" />

      <Navbar />
      <main>
        <HeroSection />
        <LogoCloud />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
