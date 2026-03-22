export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
        D
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-500">
        DevStash
      </p>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
