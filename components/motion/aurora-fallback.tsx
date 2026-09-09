/**
 * Static aurora — the no-WebGL atmosphere. Used as the dynamic-import
 * loading state and the reduced-motion path, so first paint and motion-
 * sensitive visitors get the same calm field the shader would have drawn.
 */
export function AuroraFallback() {
  return (
    <>
      <div className="absolute inset-0 bg-canvas" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(196,176,255,0.28), transparent 60%), radial-gradient(ellipse 70% 50% at 70% 80%, rgba(126,232,200,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,184,224,0.14), transparent 70%)",
        }}
      />
    </>
  );
}
