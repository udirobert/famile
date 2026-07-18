export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-10 sm:px-10 sm:py-12">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-aurora-lavender/20 border-t-aurora-mint" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-aurora-lavender/20" />
        </div>
        <p className="font-display text-sm tracking-tight text-ink-muted">
          Preparing the suite…
        </p>
      </div>
    </div>
  );
}
