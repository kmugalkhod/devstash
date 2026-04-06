import { Code, Sparkles, Terminal, Check } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-4 max-w-5xl mx-auto">
      {/* Section header */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <h2 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300 max-md:text-4xl">
          Everything in One Place
        </h2>
        <p className="text-zinc-300 text-lg">
          Finally, a unified workspace that bridges the gap between your
          snippets, prompts, commands, and notes.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-5 auto-rows-[minmax(280px,auto)] max-lg:grid-cols-1">
        {/* Card 1: Code Snippets — span 2 */}
        <div className="col-span-2 relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-0.5 max-lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
              <Code className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Code Snippets</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-5">
              Save, categorize, and find code blocks instantly with our
              blazing-fast global search. Syntax highlighting for over 100 languages.
            </p>
            <div className="mt-auto rounded-xl bg-black border border-white/[0.08] p-4 font-mono text-sm text-zinc-400">
              <span className="text-zinc-300">const </span>
              <span className="text-blue-400">stash</span>
              <span className="text-zinc-300"> = new </span>
              <span className="text-blue-300">DevStash</span>
              <span className="text-zinc-300">();</span>
              <br />
              <span className="text-zinc-300">await stash.</span>
              <span className="text-blue-400">store</span>
              <span className="text-zinc-300">(myKnowledge);</span>
            </div>
          </div>
        </div>

        {/* Card 2: AI Prompts */}
        <div className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Prompts</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-5">
              Your personal library of effective AI triggers and system messages.
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              {["System prompt", "Review workflow", "Debugging"].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs text-amber-300 bg-white/[0.06] border border-white/[0.08]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Commands */}
        <div className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Commands</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-5">
              Store complex terminal commands safely without losing them in history.
            </p>
            <div className="mt-auto rounded-xl bg-[#050505] border border-white/[0.08] px-4 py-3 font-mono text-sm text-cyan-300">
              $ git rebase -i HEAD~5
            </div>
          </div>
        </div>

        {/* Card 4: AI Insights — span 2 */}
        <div className="col-span-2 relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-0.5 max-lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-5">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AI-Powered Insights</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Get automatic tags, code summaries, and &ldquo;Explain This Code&rdquo; functionality
              powered by advanced LLMs directly inside your dashboard.
            </p>
            <ul className="flex flex-col gap-1.5 mb-5">
              {["Auto-tagging", "Code explanations", "Prompt optimization"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-zinc-300 text-sm">
                  <span className="w-1 h-1 rounded-full bg-violet-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto rounded-2xl bg-black/45 border border-white/[0.08] p-4 grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">AI Generated Tags</span>
                <strong className="text-zinc-200 font-medium">typescript, auth, performance</strong>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Summary</span>
                <strong className="text-zinc-300 font-medium">Reusable knowledge, searchable instantly.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
