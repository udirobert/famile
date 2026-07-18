"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uIntensity;
  varying vec2 vUv;

  // 2D simplex noise - Ashima Arts
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv;
    p.x *= uResolution.x / max(uResolution.y, 1.0);

    float t = uTime * 0.04;
    vec2 q = vec2(fbm(p * 1.2 + t), fbm(p * 1.2 + vec2(1.7, 0.9) - t));
    float n = fbm(p + q * 1.6);

    float band1 = smoothstep(0.30, 0.62, n);
    float band2 = smoothstep(0.50, 0.82, n);
    float band3 = smoothstep(0.72, 0.96, n);

    vec3 lavender = vec3(0.769, 0.690, 1.000);
    vec3 pink     = vec3(1.000, 0.722, 0.878);
    vec3 mint     = vec3(0.494, 0.910, 0.784);
    vec3 amber    = vec3(1.000, 0.773, 0.506);
    vec3 deep     = vec3(0.039, 0.027, 0.086);

    vec3 col = deep;
    col = mix(col, lavender, band1 * 0.78);
    col = mix(col, pink, band2 * 0.55);
    col = mix(col, mint, band3 * 0.45);
    col = mix(col, amber, smoothstep(0.86, 1.0, n) * 0.35);

    float vig = 1.0 - smoothstep(0.45, 1.25, length(uv - 0.5) * 1.1);
    col *= mix(0.35, 1.0, vig);

    float md = length((uv - uMouse) * vec2(uResolution.x / uResolution.y, 1.0));
    col += vec3(0.12, 0.09, 0.18) * smoothstep(0.45, 0.0, md) * 0.6;

    col *= uIntensity;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function AuroraPlane({ intensity = 1 }: { intensity?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const { size, pointer } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: intensity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += delta;
    mouse.current.lerp(
      new THREE.Vector2(pointer.x * 0.5 + 0.5, -pointer.y * 0.5 + 0.5),
      0.05,
    );
    mat.current.uniforms.uMouse.value.copy(mouse.current);
    mat.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export function AuroraCanvas({
  className,
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0, margin: "200px" });
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div ref={ref} className={className} aria-hidden>
        <div className="absolute inset-0 bg-canvas" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(196,176,255,0.28), transparent 60%), radial-gradient(ellipse 70% 50% at 70% 80%, rgba(126,232,200,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,184,224,0.14), transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className={className} aria-hidden>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        style={{ width: "100%", height: "100%" }}
      >
        <AuroraPlane intensity={intensity} />
      </Canvas>
    </div>
  );
}
