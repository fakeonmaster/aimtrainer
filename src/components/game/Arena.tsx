import { MeshStandardMaterial } from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function Arena() {
  const floorRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (floorRef.current) {
      floorRef.current.rotation.y += 0; // keep static
    }
  });

  const wallMaterial = new MeshStandardMaterial({ color: '#ffffffff', roughness: 0.8 });
  const floorMaterial = new MeshStandardMaterial({ color: '#ffffffff', roughness: 1 });

  const arenaSize = 50;
  const wallHeight = 3;

  return (
    <>
      {/* Floor */}
      <mesh ref={floorRef} receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[arenaSize, 0.1, arenaSize]} />
        <meshStandardMaterial {...floorMaterial} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, wallHeight / 2, -arenaSize / 2]} receiveShadow castShadow>
        <boxGeometry args={[arenaSize, wallHeight, 0.2]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>
      <mesh position={[0, wallHeight / 2, arenaSize / 2]} receiveShadow castShadow>
        <boxGeometry args={[arenaSize, wallHeight, 0.2]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>
      <mesh position={[-arenaSize / 2, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, wallHeight, arenaSize]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>
      <mesh position={[arenaSize / 2, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, wallHeight, arenaSize]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>
    </>
  );
}
