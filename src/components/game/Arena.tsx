// 3D Arena environment component
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Arena() {
  const gridRef = useRef<THREE.GridHelper>(null);

  // Subtle grid animation
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#0a0f14"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grid overlay */}
      <gridHelper 
        ref={gridRef}
        args={[100, 100, '#1a3040', '#0d1820']} 
        position={[0, 0.01, 0]}
      />

      {/* Walls - back */}
      <mesh position={[0, 10, -40]} receiveShadow>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial 
          color="#0d1820"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Side walls */}
      <mesh position={[-20, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial 
          color="#0a1218"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[20, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial 
          color="#0a1218"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Ambient lighting strips on floor */}
      <mesh position={[0, 0.02, -15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 0.1]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.02, -25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 0.1]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} />
      </mesh>

      {/* Glowing pillars for depth reference */}
      <GlowPillar position={[-15, 0, -30]} />
      <GlowPillar position={[15, 0, -30]} />
      <GlowPillar position={[-15, 0, -15]} />
      <GlowPillar position={[15, 0, -15]} />
    </group>
  );
}

// Glowing pillar component for visual reference
function GlowPillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pillar body */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[0.5, 6, 0.5]} />
        <meshStandardMaterial 
          color="#1a2530"
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Glow strip */}
      <mesh position={[0, 3, 0.26]}>
        <boxGeometry args={[0.1, 5.5, 0.02]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
      </mesh>
      
      {/* Point light for glow effect */}
      <pointLight 
        position={[0, 3, 0.5]} 
        color="#00f0ff" 
        intensity={0.5} 
        distance={5}
        decay={2}
      />
    </group>
  );
}
