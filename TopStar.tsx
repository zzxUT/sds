import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getRandomSpherePoint } from '../utils/math';

interface TopStarProps {
  progress: number;
}

export const TopStar: React.FC<TopStarProps> = ({ progress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentProgress = useRef(0);
  
  const { scatterPos, treePos, starShape } = useMemo(() => {
    // 1. Define Positions
    const sPos = getRandomSpherePoint(25);
    const tPos = new THREE.Vector3(0, 5.8, 0); 

    // 2. Create 5-Pointed Star Shape
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.4;
    
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    return { scatterPos: sPos, treePos: tPos, starShape: shape };
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.4, 
    bevelEnabled: true,
    bevelThickness: 0.1, 
    bevelSize: 0.1, 
    bevelSegments: 4, 
  }), []);

  useFrame((state, delta) => {
    // Smooth transition
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, progress, 0.04);
    const t = currentProgress.current;
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    if (groupRef.current) {
        // Position
        groupRef.current.position.lerpVectors(scatterPos, treePos, easedT);
        
        // Rotation Logic
        if (progress === 1 && t > 0.8) {
             // TREE STATE: Strictly Static
             // Quickly dampen rotation to zero to ensure it faces front (Z+)
             groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
             groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
             groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
        } else {
             // SCATTERED / TRANSITION: Free tumble
             groupRef.current.rotation.x += delta * 0.5;
             groupRef.current.rotation.y += delta * 0.3;
             groupRef.current.rotation.z += delta * 0.1;
        }

        // Scale - Strictly Static 1.0 (No breathing)
        groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Single Mesh - Centered on Z axis manually (-depth/2) */}
      <mesh castShadow position={[0, 0, -0.2]}>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffcc00"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={1.0}
          envMapIntensity={2.0}
        />
      </mesh>
      
      <pointLight intensity={2} distance={5} color="#ffd700" decay={2} />
    </group>
  );
};