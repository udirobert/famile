import { Grain } from "@/components/ui/grain";
import { Nav } from "./nav";
import { Footer } from "./footer";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AmbientAurora />
      <Grain />
      <Nav />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}

function AmbientAurora() {
  // One painted layer instead of four blurred fixed divs: a blurred
  // full-viewport stack re-composites on every scroll frame on mobile.
  // Multi-stop radial gradients give the same soft edges for free.
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none bg-canvas"
      style={{
        backgroundImage: [
          "radial-gradient(46% 46% at 50% -10%, rgba(196,176,255,0.18), transparent 72%)",
          "radial-gradient(40% 40% at 110% 104%, rgba(255,184,224,0.12), transparent 72%)",
          "radial-gradient(40% 40% at -10% 104%, rgba(126,232,200,0.09), transparent 72%)",
          "radial-gradient(65% 48% at 50% 115%, rgba(255,197,129,0.15), transparent 72%)",
        ].join(", "),
      }}
    />
  );
}
