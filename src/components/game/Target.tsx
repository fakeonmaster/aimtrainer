// 3D Target component with hit detection
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Target as TargetType } from '@/hooks/useTargets';

interface TargetProps {
  target: TargetType;
  onHit: (isHeadshot: boolean) => void;
}

export function Target({ target, onHit }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isSpawning, setIsSpawning] = useState(true);
  const [position, setPosition] = useState(target.position.clone());
  const moveDirectionRef = useRef(target.moveDirection);
  
  const baseSize = target.size;
  const bodyRadius = baseSize * 0.5;
  const headRadius = baseSize * 0.2; // Headshot zone is smaller

  // Spawn animation
  useEffect(() => {
    setIsSpawning(true);
    const timer = setTimeout(() => setIsSpawning(false), 200);
    return () => clearTimeout(timer);
  }, [target.id]);

  // Update movement
  useFrame((_, delta) => {
    if (!target.isMoving || isSpawning) return;

    setPosition(prev => {
      const newX = prev.x + moveDirectionRef.current * target.moveSpeed * delta;
      
      // Reverse at boundaries
      if (Math.abs(newX) > 9) {
        moveDirectionRef.current *= -1;
      }

      return new THREE.Vector3(
        Math.max(-9, Math.min(9, newX)),
        prev.y,
        prev.z
      );
    });
  });

  // Scale animation for spawn
  const scale = isSpawning ? 0 : 1;

  // Expose hit detection via userData
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData = {
        isTarget: true,
        bodyRadius,
        headRadius,
        onHit,
      };
    }
  }, [bodyRadius, headRadius, onHit]);

  return (
    <group 
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      scale={[scale, scale, scale]}
    >
      {/* Outer ring (body hit zone) */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[bodyRadius * 0.6, bodyRadius, 32]} />
        <meshBasicMaterial 
          color="#ff3333" 
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Middle ring */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[headRadius * 1.5, bodyRadius * 0.6, 32]} />
        <meshBasicMaterial 
          color="#ff5555" 
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner circle (headshot zone) */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[headRadius, 32]} />
        <meshBasicMaterial 
          color="#ffaa00"
          transparent
          opacity={1}
        />
      </mesh>

      {/* Center dot */}
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[headRadius * 0.3, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Glow effect */}
      <pointLight 
        position={[0, 0, 0.5]} 
        color="#ff3333" 
        intensity={1} 
        distance={3}
        decay={2}
      />

      {/* Invisible collision meshes for raycasting */}
      {/* Body hitbox */}
      <mesh visible={false} userData={{ hitType: 'body' }}>
        <circleGeometry args={[bodyRadius, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Head hitbox (on top for priority) */}
      <mesh position={[0, 0, 0.1]} visible={false} userData={{ hitType: 'head' }}>
        <circleGeometry args={[headRadius, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}
