import Navbar from "@/components/homepage/Navbar";
import HeroSection from "@/components/homepage/HeroSection";
import LogoCloud from "@/components/homepage/LogoCloud";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import PricingSection from "@/components/homepage/PricingSection";
import CTASection from "@/components/homepage/CTASection";
import Footer from "@/components/homepage/Footer";
import { auth } from "@/auth";
import { isUserPro } from "@/lib/pro";

export default async function HomePage() {
  const session = await auth();
  const isAuthed = Boolean(session?.user?.id);
  const isPro = isAuthed ? await isUserPro(session!.user!.id!) : false;

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
        <PricingSection isAuthenticated={isAuthed} isPro={isPro} />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
