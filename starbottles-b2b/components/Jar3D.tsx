"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── Smooth lathe profile ────────────────────────────────────────────────────
function smoothProfile(
  pts: [number, number][],
  sub = 3
): THREE.Vector2[] {
  const out: THREE.Vector2[] = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[Math.min(i + 1, n - 1)];
    const p3 = pts[Math.min(i + 2, n - 1)];
    for (let t = 0; t < sub; t++) {
      const s = t / sub, s2 = s * s, s3 = s2 * s;
      const x = 0.5 * (2*p1[0] + (-p0[0]+p2[0])*s + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*s2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*s3);
      const y = 0.5 * (2*p1[1] + (-p0[1]+p2[1])*s + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*s2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*s3);
      out.push(new THREE.Vector2(Math.max(0, x), y));
    }
  }
  out.push(new THREE.Vector2(pts[n-1][0], pts[n-1][1]));
  return out;
}

const SEG = 48; // Reduced from 128 — still smooth enough

// ─── PET Jar body ────────────────────────────────────────────────────────────
function JarBody() {
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(smoothProfile([
      [0, 0], [0.95, 0], [1.02, 0.05], [1.1, 0.2], [1.2, 0.5],
      [1.32, 0.9], [1.38, 1.3], [1.4, 1.6], [1.38, 1.95],
      [1.32, 2.25], [1.2, 2.5], [1.02, 2.72], [0.85, 2.84],
      [0.78, 2.9], [0.75, 2.98], [0.76, 3.08], [0.78, 3.12], [0.72, 3.12],
    ], 3), SEG);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial
        color="#c8cce8"
        roughness={0.04}
        metalness={0.0}
        transparent
        opacity={0.28}
        clearcoat={1}
        clearcoatRoughness={0.03}
        envMapIntensity={1.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Cap ─────────────────────────────────────────────────────────────────────
function Cap() {
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(smoothProfile([
      [0, 0.42], [0.6, 0.42], [0.78, 0.41], [0.84, 0.39], [0.87, 0.36],
      [0.88, 0.3], [0.88, 0.0], [0.87, -0.03], [0.84, -0.05],
      [0.85, -0.06], [0.85, -0.08], [0.82, -0.08], [0.82, -0.05],
      [0.75, -0.05], [0.75, 0.0], [0.74, 0.3], [0.74, 0.38], [0.0, 0.38],
    ], 3), SEG);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group position={[0, 3.12, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color="#1B2178"
          roughness={0.3}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Bottom disc ─────────────────────────────────────────────────────────────
function BottomDisc() {
  return (
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.94, SEG]} />
      <meshStandardMaterial color="#d0d4ea" transparent opacity={0.12} />
    </mesh>
  );
}

// ─── Thread ring ─────────────────────────────────────────────────────────────
function ThreadRing() {
  return (
    <mesh position={[0, 3.04, 0]}>
      <torusGeometry args={[0.77, 0.025, 6, SEG]} />
      <meshStandardMaterial color="#b8bdd8" transparent opacity={0.25} />
    </mesh>
  );
}

// ─── Rotating jar ────────────────────────────────────────────────────────────
function JarAssembly() {
  const ref = useRef<THREE.Group>(null);
  const interacting = useRef(false);

  useFrame((_, delta) => {
    if (ref.current && !interacting.current) {
      ref.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group
      ref={ref}
      position={[0, -1.8, 0]}
      onPointerDown={() => { interacting.current = true; }}
      onPointerUp={() => { interacting.current = false; }}
      onPointerLeave={() => { interacting.current = false; }}
    >
      <JarBody />
      <BottomDisc />
      <ThreadRing />
      <Cap />
    </group>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Jar3D() {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <Canvas
        camera={{ position: [0, 0.6, 8.5], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#e8eaff" />
        <directionalLight position={[0, 2, -5]} intensity={0.6} color="#f0f0ff" />
        {/* Subtle rim light for depth */}
        <directionalLight position={[-5, 0, 3]} intensity={0.3} color="#c0c4f0" />

        <Suspense fallback={null}>
          <JarAssembly />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          dampingFactor={0.08}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
