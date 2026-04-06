export default function LogoCloud() {
  const companies = ["Acme Corp", "Globex", "Soylent", "Initech", "Umbrella"];

  return (
    <section className="py-16 px-4 text-center border-b border-white/[0.05]">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-8">
        Trusted by developers at innovative companies
      </p>
      <div className="flex flex-wrap justify-center gap-12">
        {companies.map((name) => (
          <span
            key={name}
            className="font-bold text-xl text-white/50 hover:text-white/90 transition-opacity cursor-default"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
