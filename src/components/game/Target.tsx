// Target.tsx
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface TargetProps {
  target: { position: { x: number; y: number; z: number } };
  onHit: (isHeadshot?: boolean) => void;
}

export function Target({ target, onHit }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF('/models/humanoid.glb'); // path to your model
  const { actions } = useAnimations(gltf.animations, groupRef);

  // Play Idle animation on spawn
  useEffect(() => {
    actions['Idle']?.reset().fadeIn(0.2).play();
  }, [actions]);

  // Optional: small up-down floating effect
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        target.position.y + Math.sin(state.clock.getElapsedTime() * 2) * 0.02;
    }
  });

  // Handle hit
  const handleHit = () => {
    // Play "Hit" animation if it exists
    if (actions['Hit']) {
      actions['Idle']?.fadeOut(0.1);
      actions['Hit']?.reset().fadeIn(0.1).play();
    }

    // Callback for scoring
    onHit(true);

    // Optional: remove target after animation
    setTimeout(() => {
      if (groupRef.current) groupRef.current.visible = false;
    }, 500);
  };

  return (
    <group
      ref={groupRef}
      position={[target.position.x, target.position.y, target.position.z]}
      scale={[1, 1, 1]}
      onClick={handleHit}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}
