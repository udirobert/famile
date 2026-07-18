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
  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />
      <div
        className="absolute -top-1/4 left-1/2 h-[85vh] w-[85vh] -translate-x-1/2 rounded-full opacity-50 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(196,176,255,0.20), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-32 h-[60vh] w-[60vh] rounded-full opacity-40 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,184,224,0.16), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 -left-32 h-[60vh] w-[60vh] rounded-full opacity-40 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(126,232,200,0.12), transparent 70%)",
        }}
      />
    </div>
  );
}
