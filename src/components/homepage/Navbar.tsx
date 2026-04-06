import Link from "next/link";
import { Layers } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-6 pb-4">
      <div className="flex items-center justify-between w-full max-w-5xl px-5 py-3 rounded-full bg-black/40 border border-white/[0.08] backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
          <Layers className="w-5 h-5" />
          DevStash
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
