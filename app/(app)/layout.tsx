import { ViewTransition } from "react";
import { Grain } from "@/components/ui/grain";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-1">
      <AmbientAurora />
      <Grain />
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        <Topbar />
        <main className="flex-1 px-6 py-8 sm:px-10 sm:py-12">
          <ViewTransition
            enter={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              default: "none",
            }}
            exit={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              default: "none",
            }}
            default="none"
          >
            {children}
          </ViewTransition>
        </main>
      </div>
    </div>
  );
}

function AmbientAurora() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <div className="absolute inset-0 bg-canvas" />
      <div
        className="absolute -top-1/4 right-0 h-[60vh] w-[60vh] rounded-full opacity-40 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(196,176,255,0.18), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 -left-20 h-[50vh] w-[50vh] rounded-full opacity-30 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(126,232,200,0.12), transparent 70%)",
        }}
      />
    </div>
  );
}
