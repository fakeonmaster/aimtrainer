// src/components/game/CoverBox.tsx
import { useRef } from 'react';
import * as THREE from 'three';

interface CoverBoxProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

export function CoverBox({ 
  position, 
  size = [2, 2, 1], 
  color = '#8B4513' 
}: CoverBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      userData={{ type: 'cover' }}
      castShadow 
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

// Multiple cover boxes component
export function CoverBoxes() {
  const coverPositions: [number, number, number][] = [
    [-10, 1, -10],
    [10, 1, -10],
    [-15, 1, 0],
    [15, 1, 0],
    [0, 1, -20],
    [-8, 1, 8],
    [8, 1, 8],
    [0, 1, 15],
  ];

  return (
    <group>
      {coverPositions.map((pos, index) => (
        <CoverBox 
          key={index} 
          position={pos}
          size={[2, 2, 1]}
          color={index % 2 === 0 ? '#8B4513' : '#A0522D'}
        />
      ))}
    </group>
  );
}