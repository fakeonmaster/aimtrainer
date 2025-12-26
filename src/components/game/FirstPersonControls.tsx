// First-person controls with pointer lock
import { useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FirstPersonControlsProps {
  sensitivity: number;
  isPlaying: boolean;
  isPaused: boolean;
  onShoot: (raycaster: THREE.Raycaster) => void;
  onPositionChange?: (position: THREE.Vector3) => void;
}

export function FirstPersonControls({ 
  sensitivity, 
  isPlaying, 
  isPaused,
  onShoot,
  onPositionChange
}: FirstPersonControlsProps) {
  const { camera, gl } = useThree();
  const isLockedRef = useRef(false);
  const moveRef = useRef({ forward: false, backward: false, left: false, right: false });
  const velocityRef = useRef(new THREE.Vector3());
  const canShootRef = useRef(true);

  // Movement speed
  const MOVE_SPEED = 8;
  const FRICTION = 10;

  // Request pointer lock
  const requestPointerLock = useCallback(() => {
    if (isPlaying && !isPaused) {
      gl.domElement.requestPointerLock();
    }
  }, [gl, isPlaying, isPaused]);

  // Handle pointer lock change
  useEffect(() => {
    const handleLockChange = () => {
      isLockedRef.current = document.pointerLockElement === gl.domElement;
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, [gl]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isLockedRef.current || !isPlaying || isPaused) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      // Get current rotation
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);

      // Apply mouse movement
      euler.y -= movementX * sensitivity;
      euler.x -= movementY * sensitivity;

      // Clamp vertical rotation
      euler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.x));

      camera.quaternion.setFromEuler(euler);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [camera, sensitivity, isPlaying, isPaused]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveRef.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveRef.current.right = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isPaused]);

  // Handle shooting
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!isLockedRef.current || !isPlaying || isPaused) return;
      if (event.button !== 0) return; // Left click only

      // Create raycaster from camera center
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      onShoot(raycaster);
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    return () => gl.domElement.removeEventListener('mousedown', handleMouseDown);
  }, [camera, gl, isPlaying, isPaused, onShoot]);

  // Click to lock pointer
  useEffect(() => {
    const handleClick = () => {
      if (!isLockedRef.current && isPlaying && !isPaused) {
        requestPointerLock();
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [gl, isPlaying, isPaused, requestPointerLock]);

  // Update movement each frame
  useFrame((_, delta) => {
    if (!isPlaying || isPaused) return;

    const move = moveRef.current;
    const direction = new THREE.Vector3();

    // Get forward/right vectors
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Calculate movement direction
    if (move.forward) direction.add(forward);
    if (move.backward) direction.sub(forward);
    if (move.right) direction.add(right);
    if (move.left) direction.sub(right);

    direction.normalize();

    // Apply acceleration
    if (direction.length() > 0) {
      velocityRef.current.add(direction.multiplyScalar(MOVE_SPEED * delta * 10));
    }

    // Apply friction
    velocityRef.current.multiplyScalar(1 - FRICTION * delta);

    // Limit speed
    if (velocityRef.current.length() > MOVE_SPEED) {
      velocityRef.current.normalize().multiplyScalar(MOVE_SPEED);
    }

    // Move camera
    camera.position.add(velocityRef.current.clone().multiplyScalar(delta));

    // Keep within bounds
    camera.position.x = Math.max(-20, Math.min(20, camera.position.x));
    camera.position.z = Math.max(-20, Math.min(20, camera.position.z));
    camera.position.y = 1.7; // Eye height

    // Update player position for AI
    if (onPositionChange) {
      onPositionChange(camera.position.clone());
    }
  });

  // Reset camera on game start
  useEffect(() => {
    if (isPlaying) {
      camera.position.set(0, 1.7, 0);
      camera.rotation.set(0, 0, 0);
      velocityRef.current.set(0, 0, 0);
    }
  }, [isPlaying, camera]);

  return null;
}
