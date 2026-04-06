import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-44 pb-24 px-4 text-center overflow-hidden max-w-6xl mx-auto">
      {/* Badge */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-zinc-400 bg-white/[0.03] border border-white/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
          Introducing DevStash 2.0
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-[4.5rem] leading-[1.1] font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 max-lg:text-6xl max-md:text-5xl">
        Stop Losing Your<br />Developer Knowledge.
      </h1>

      {/* Subtitle */}
      <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
        One fast, searchable, AI-enhanced hub for all your dev knowledge,
        snippets, prompts, and resources. Built for modern engineers.
      </p>

      {/* Proof Strip */}
      <div className="flex flex-wrap justify-center gap-2 mx-auto mb-10 max-w-xl">
        {["Snippets", "Prompts", "Commands", "Notes", "Files", "Links"].map((label) => (
          <span
            key={label}
            className="px-3 py-1.5 rounded-full text-sm text-zinc-300 bg-white/[0.04] border border-white/[0.08]"
          >
            {label}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex justify-center gap-3 mb-4 max-sm:flex-col max-sm:items-center">
        <Link
          href="/register"
          className="px-7 py-3.5 text-base font-medium bg-white text-black rounded-xl hover:bg-zinc-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
        >
          Start Organizing Free
        </Link>
        <Link
          href="/sign-in"
          className="px-7 py-3.5 text-base font-medium text-white rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
        >
          Sign In
        </Link>
      </div>

      {/* Microcopy */}
      <p className="text-sm text-zinc-500 mb-20">
        No sales call. No setup friction. Sign in and start using DevStash.
      </p>

      {/* Dashboard Preview */}
      <div className="group relative max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-950 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.9),0_0_100px_rgba(99,102,241,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95),0_0_150px_rgba(99,102,241,0.15)]">
          <Image
            src="/screenshots/x-post-dashboard.png"
            alt="DevStash Dashboard"
            width={1100}
            height={660}
            className="w-full block rounded-2xl object-cover"
            priority
          />
          {/* Top gradient border overlay */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-white/[0.06] to-transparent" />
        </div>
        {/* Outer glow */}
        <div className="absolute -inset-px rounded-2xl pointer-events-none border border-white/[0.05]" />
      </div>
    </section>
  );
}
