// src/components/game/Soldier.tsx
import { useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface SoldierProps {
  position?: [number, number, number];
  scale?: number;
}

export function Soldier({ position = [0, 0, -5], scale = 2 }: SoldierProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF('/model/soldier.glb');
  
  // Setup animations if any
  const { actions } = useAnimations(gltf.animations, groupRef);
  if (actions?.Idle) {
    actions.Idle.play();
  }

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/model/soldier.glb');
