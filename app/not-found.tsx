import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center">
      <div aria-hidden className="absolute inset-0 -z-10 bg-canvas" />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[80vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,184,224,0.18), transparent 70%)",
        }}
      />
      <Container className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-dim">
          404
        </p>
        <h1 className="mt-4 font-display text-6xl tracking-tight sm:text-7xl">
          Nothing{" "}
          <span className="text-aurora-gradient text-luminous">here.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-ink-muted">
          This route is quiet - maybe too quiet. Let us guide you back to
          something useful.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button href="/">Back to site</Button>
          <Button href="/ask" variant="secondary">
            Ask
          </Button>
        </div>
      </Container>
    </div>
  );
}
