import Link from "next/link";
import { MorphBlob } from "@/components/motion/morph-blob";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Product } from "@/lib/products";

export function ProductDetail({ product }: { product: Product }) {
  return (
    <Container className="py-4">
      <Link
        href="/dashboard"
        transitionTypes={["nav-back"]}
        className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Dashboard
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-line-strong px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
              {product.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-aurora-mint/30 bg-aurora-mint/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-aurora-mint">
              <span className="h-1 w-1 rounded-full bg-aurora-mint" />
              {product.status}
            </span>
          </div>

          <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink">{product.tagline}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
            {product.longDescription}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 rounded-[var(--radius-lg)] border border-line p-6">
            {product.metric.map((m) => (
              <div key={m.label}>
                <p
                  className="font-display text-3xl tracking-tight"
                  style={{ color: product.accent }}
                >
                  {m.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-dim">
                  {m.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-ink-dim">
              Capabilities
            </h2>
            <ul className="space-y-3">
              {product.features.map((f) => (
                <li
                  key={f.title}
                  className="rounded-[var(--radius-md)] border border-line p-4"
                >
                  <p className="text-sm text-ink">{f.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex gap-3">
            <Button size="md" transitionTypes={["nav-forward"]}>
              Begin a session
            </Button>
            <Button href="/contact" variant="secondary" size="md">
              Talk to care
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="sticky top-24">
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <div
                className="absolute inset-8 rounded-full opacity-50 blur-[80px]"
                style={{
                  background: `radial-gradient(circle, ${product.accent}55, transparent 70%)`,
                }}
                aria-hidden
              />
              <MorphBlob
                from={product.glyph.from}
                to={product.glyph.to}
                speed={1.3}
                distort={0.44}
                className="absolute inset-0"
              />
            </div>
            <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-canvas-elevated/30 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-dim">
                Live signal
              </p>
              <p className="mt-2 font-display text-lg text-ink">
                {product.slug === "sukari"
                  ? "One thing worth doing today."
                  : "Recovery trending well. Nothing to flag."}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {product.slug === "sukari"
                  ? "Tap to try it before it counts."
                  : "Next adaptive update in 4h."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
