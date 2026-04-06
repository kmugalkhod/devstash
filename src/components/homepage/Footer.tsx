import Link from "next/link";
import { Layers } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] bg-black px-4 pt-16 pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between flex-wrap gap-14 mb-14">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-4">
              <Layers className="w-5 h-5" />
              DevStash
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The modern developer&apos;s knowledge hub. Snippets, prompts, and
              commands organized perfectly.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 flex-wrap">
            <div>
              <h4 className="text-white text-sm font-semibold mb-5">Product</h4>
              <div className="flex flex-col gap-3">
                <Link href="#features" className="text-zinc-500 text-sm hover:text-white transition-colors">Features</Link>
                <Link href="#pricing" className="text-zinc-500 text-sm hover:text-white transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-5">Company</h4>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">About Us</Link>
                <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Contact</Link>
                <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.05] pt-7 text-center text-zinc-600 text-sm">
          &copy; {year} DevStash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
