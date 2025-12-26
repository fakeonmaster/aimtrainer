// Enhanced Bullet component with better physics and cleanup
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BulletProps {
  startPosition: THREE.Vector3;
  direction: THREE.Vector3;
  speed?: number;
  onHit?: (target: THREE.Object3D, damage: number) => void;
  onExpire?: () => void;
  damage?: number;
  isPlayerBullet?: boolean;
}

export function Bullet({ 
  startPosition, 
  direction, 
  speed = 50, 
  onHit, 
  onExpire,
  damage = 25,
  isPlayerBullet = false
}: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(startPosition.clone());
  const [hasExpired, setHasExpired] = useState(false);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  useFrame((state, delta) => {
    if (hasExpired || !meshRef.current) return;

    // Move bullet
    const movement = direction.clone().multiplyScalar(speed * delta);
    const newPosition = position.clone().add(movement);
    const frameDistance = movement.length();
    
    setPosition(newPosition);
    setDistanceTraveled(prev => prev + frameDistance);
    meshRef.current.position.copy(newPosition);

    // Check for collisions using raycasting
    const raycaster = new THREE.Raycaster(position, direction, 0, frameDistance + 0.1);
    if (state.scene) {
      const intersects = raycaster.intersectObjects(state.scene.children, true);
      
      for (const intersect of intersects) {
        const object = intersect.object;
        
        // Skip self and other bullets
        if (object === meshRef.current || object.userData?.type === 'bullet') continue;
        
        // Hit cover box
        if (object.userData?.type === 'cover') {
          setHasExpired(true);
          if (onExpire) onExpire();
          return;
        }
        
        // Hit arena walls/floor
        if (object.userData?.type === 'arena') {
          setHasExpired(true);
          if (onExpire) onExpire();
          return;
        }
        
        // Hit player or enemy
        if (object.userData?.hitType && onHit) {
          const hitDamage = object.userData?.damage || damage;
          onHit(object, hitDamage);
          setHasExpired(true);
          if (onExpire) onExpire();
          return;
        }
      }
    }

    // Expire after traveling too far
    if (distanceTraveled > 100) {
      setHasExpired(true);
      if (onExpire) onExpire();
    }

    // Expire if bullet goes out of arena bounds
    if (Math.abs(newPosition.x) > 30 || Math.abs(newPosition.z) > 30 || newPosition.y < -5 || newPosition.y > 20) {
      setHasExpired(true);
      if (onExpire) onExpire();
    }
  });

  useEffect(() => {
    // Auto-expire after 3 seconds as backup
    const timer = setTimeout(() => {
      if (!hasExpired) {
        setHasExpired(true);
        if (onExpire) onExpire();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasExpired, onExpire]);

  if (hasExpired) return null;

  return (
    <mesh 
      ref={meshRef} 
      position={startPosition}
      userData={{ type: 'bullet', isPlayerBullet }}
    >
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshBasicMaterial color={isPlayerBullet ? '#ffff00' : '#ff4444'} />
    </mesh>
  );
}