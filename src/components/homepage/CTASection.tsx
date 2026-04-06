import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-16 px-4 pb-32 max-w-4xl mx-auto text-center">
      <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-20 overflow-hidden max-md:p-12">
        {/* Center radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />

        <h2 className="relative text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300 max-md:text-3xl">
          Ready to organize your chaos?
        </h2>
        <p className="relative text-zinc-400 text-lg mb-8">
          Join thousands of developers keeping their knowledge safe in DevStash.
        </p>
        <Link
          href="/register"
          className="relative inline-block px-8 py-3.5 text-base font-medium bg-white text-black rounded-xl hover:bg-zinc-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
        >
          Get Started for Free
        </Link>
      </div>
    </section>
  );
}
