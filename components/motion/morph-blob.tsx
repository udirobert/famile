"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import * as THREE from "three";

type MorphBlobProps = {
  from: string;
  to: string;
  speed?: number;
  distort?: number;
  className?: string;
};

function Blob({
  from,
  to,
  speed = 1.4,
  distort = 0.42,
}: Omit<MorphBlobProps, "className">) {
  const mesh = useRef<THREE.Mesh>(null!);
  const fromColor = useMemo(() => new THREE.Color(from), [from]);
  const toColor = useMemo(() => new THREE.Color(to), [to]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.08;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.12;

    // Complementary color cycle: color lerps from->to while emissive lerps to->from
    const m = mesh.current.material;
    if (!m || Array.isArray(m)) return;
    const material = m as THREE.MeshPhysicalMaterial;
    const mix = (Math.sin(state.clock.elapsedTime * 0.18) + 1) * 0.5;
    material.color.copy(fromColor).lerp(toColor, mix);
    material.emissive.copy(toColor).lerp(fromColor, mix);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.45}>
      <mesh ref={mesh} scale={1.12}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color={fromColor}
          emissive={toColor}
          emissiveIntensity={0.18}
          roughness={0.12}
          metalness={0.78}
          distort={distort}
          speed={speed}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  );
}

export function MorphBlob({
  from,
  to,
  speed,
  distort,
  className,
}: MorphBlobProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0, margin: "100px" });
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div ref={ref} className={className} aria-hidden>
        <div
          className="absolute inset-[10%] rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${from}, ${to})`,
            filter: "blur(8px)",
          }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        frameloop={inView ? "always" : "never"}
        style={{ width: "100%", height: "100%" }}
        className="!overflow-visible"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#c4b0ff" />
        <pointLight position={[-4, -2, -3]} intensity={1.4} color="#ffb8e0" />
        <Environment preset="warehouse" />
        <Blob from={from} to={to} speed={speed} distort={distort} />
      </Canvas>
    </div>
  );
}
