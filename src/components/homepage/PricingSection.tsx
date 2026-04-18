"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const FREE_FEATURES = [
  "Up to 50 items",
  "3 Collections",
  "Basic Search",
  "Community Support",
];

const PRO_FEATURES = [
  "Unlimited items & collections",
  "All AI features (Auto-tag, Explain)",
  "File & Image uploads",
  "Priority Support",
];

type Props = {
  isAuthenticated?: boolean;
  isPro?: boolean;
};

export default function PricingSection({
  isAuthenticated = false,
  isPro = false,
}: Props) {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade() {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=%2F%23pricing`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: yearly ? "yearly" : "monthly" }),
      });
      const data = (await res.json()) as { checkout_url?: string; error?: string };
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error ?? "Failed to start checkout");
      }
      window.location.href = data.checkout_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <section id="pricing" className="py-32 px-4 max-w-4xl mx-auto">
      {/* Section header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300 max-md:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="text-zinc-300 text-lg">
          Start for free, upgrade when you need supercharged workflows.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-14">
        <span className="text-sm font-medium text-zinc-300">Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly(!yearly)}
          className="relative w-12 h-7 rounded-full border border-white/10 bg-white/10 transition-colors hover:bg-white/15"
        >
          <span
            className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
              yearly ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          Yearly
          <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            Save 25%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        {/* Free */}
        <div className="relative rounded-2xl border border-white/[0.07] bg-[rgba(10,10,10,0.6)] backdrop-blur-sm p-10 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 overflow-hidden">
          <h3 className="text-2xl font-semibold text-white mb-2">Free</h3>
          <div className="flex items-end gap-1 mb-3">
            <span className="text-7xl font-extrabold tracking-tight text-white leading-none">$0</span>
            <span className="text-zinc-400 font-medium mb-2">/mo</span>
          </div>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            For developers curating their personal stash.
          </p>
          <ul className="flex flex-col gap-4 mb-10">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm font-normal">
                <span className="flex items-center justify-center w-[18px] h-[18px] min-w-[18px] rounded-full border border-white/15">
                  <Check className="w-2.5 h-2.5 text-zinc-400" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white bg-black border border-white/10 hover:bg-zinc-900 hover:border-white/20 transition-colors"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          </Link>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border border-white/[0.04] bg-[rgba(15,15,17,0.8)] backdrop-blur-sm p-10 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 overflow-hidden">
          {/* Most Popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-0.5 rounded-full text-[0.65rem] font-black uppercase tracking-wider text-white bg-gradient-to-r from-sky-400 to-indigo-400 shadow-[0_0_25px_rgba(56,189,248,0.6)]">
            Most Popular
          </div>

          <h3 className="text-2xl font-semibold text-white mb-2">Pro</h3>
          <div className="flex items-end gap-1 mb-3">
            <span className="text-7xl font-extrabold tracking-tight text-white leading-none">
              {yearly ? "$6" : "$8"}
            </span>
            <span className="text-zinc-400 font-medium mb-2">/mo</span>
          </div>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            For professionals who need AI power and scale.
          </p>
          <ul className="flex flex-col gap-4 mb-10">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white text-sm font-medium">
                <span className="flex items-center justify-center w-[18px] h-[18px] min-w-[18px] rounded-full border border-white/30">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <Link
              href="/settings"
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
            >
              Manage Subscription
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-black bg-white hover:bg-zinc-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
