import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getConePoint, getRandomSpherePoint } from '../utils/math';
import { OrnamentData } from '../types';

interface OrnamentsProps {
  count: number; // Base count multiplier
  progress: number;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ count, progress }) => {
  const boxMeshRef = useRef<THREE.InstancedMesh>(null);
  const baubleMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const currentProgress = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // --- DATA GENERATION ---
  const { boxes, baubles, lights } = useMemo(() => {
    const boxData: OrnamentData[] = [];
    const baubleData: OrnamentData[] = [];
    const lightData: OrnamentData[] = [];

    // 1. HEAVY: Gift Boxes (Few, large, bottom-heavy)
    // Scale count by 0.15
    const boxCount = Math.floor(count * 0.15);
    for (let i = 0; i < boxCount; i++) {
      // Skew distribution towards bottom (low progress values)
      const p = Math.pow(Math.random(), 2) * 0.6 + 0.05; // mostly 0.05 to 0.65
      const angle = i * 137.5; // Golden angle for even spiral
      
      const treeP = getConePoint(14, 6.0, p, angle);
      treeP.y -= 2;
      // Push out slightly to sit on "branches"
      const dir = new THREE.Vector3(treeP.x, 0, treeP.z).normalize();
      treeP.add(dir.multiplyScalar(0.9));

      const scatterP = getRandomSpherePoint(12); // Keep boxes closer to center in space
      
      const colorVar = Math.random();
      let color = new THREE.Color('#0f4a28'); // Emerald
      if (colorVar > 0.6) color = new THREE.Color('#8b0000'); // Deep Red
      if (colorVar > 0.85) color = new THREE.Color('#d4af37'); // Gold

      boxData.push({
        id: i,
        type: 'box',
        scatterPos: scatterP,
        treePos: treeP,
        scale: Math.random() * 0.5 + 0.4, // Large
        color,
        rotationSpeed: new THREE.Vector3(Math.random()*0.5, Math.random()*0.5, Math.random()*0.5),
        weight: 1.0, // Heavy
        phase: Math.random() * 100
      });
    }

    // 2. MEDIUM: Baubles (Many, medium size, even distribution)
    // Scale count by 0.5
    const baubleCount = Math.floor(count * 0.5);
    for (let i = 0; i < baubleCount; i++) {
      const p = i / baubleCount; // Even vertical distribution
      const angle = i * 137.5 + 45; 
      
      const treeP = getConePoint(14, 5.2, p, angle);
      treeP.y -= 2;
      // Push out to tips
      const dir = new THREE.Vector3(treeP.x, 0, treeP.z).normalize();
      treeP.add(dir.multiplyScalar(0.4));

      const scatterP = getRandomSpherePoint(22); // Wide scatter

      const colorVar = Math.random();
      let color = new THREE.Color('#ffd700'); // Gold
      if (colorVar > 0.5) color = new THREE.Color('#b0b0b0'); // Silver
      if (colorVar > 0.8) color = new THREE.Color('#ff3333'); // Bright Red

      baubleData.push({
        id: i,
        type: 'sphere',
        scatterPos: scatterP,
        treePos: treeP,
        scale: Math.random() * 0.25 + 0.2,
        color,
        rotationSpeed: new THREE.Vector3(Math.random(), Math.random(), 0),
        weight: 0.5, // Medium
        phase: Math.random() * 100
      });
    }

    // 3. LIGHT: Lights/Stars (Many, small, outer shell, very light physics)
    // Scale count by 1.2 (Lots of lights)
    const lightCount = Math.floor(count * 1.2);
    for (let i = 0; i < lightCount; i++) {
      const p = Math.random(); // Totally random vertical
      const angle = Math.random() * Math.PI * 2 * 10;
      
      const treeP = getConePoint(14, 5.8, p, angle);
      treeP.y -= 2;
      // Irregular depth for lights (some inner, some outer)
      const dir = new THREE.Vector3(treeP.x, 0, treeP.z).normalize();
      treeP.add(dir.multiplyScalar(Math.random() * 0.6 - 0.2));

      const scatterP = getRandomSpherePoint(30); // Very wide scatter

      // Warm lights with some variation
      const hue = 0.1 + Math.random() * 0.05; // Yellow-Orange
      const color = new THREE.Color().setHSL(hue, 1.0, 0.6);

      lightData.push({
        id: i,
        type: 'star',
        scatterPos: scatterP,
        treePos: treeP,
        scale: Math.random() * 0.15 + 0.05,
        color,
        rotationSpeed: new THREE.Vector3(0, 0, 0),
        weight: 0.1, // Very Light
        phase: Math.random() * 100
      });
    }

    return { boxes: boxData, baubles: baubleData, lights: lightData };
  }, [count]);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Apply Colors once
    if (boxMeshRef.current) {
      boxes.forEach((d, i) => boxMeshRef.current!.setColorAt(i, d.color));
      boxMeshRef.current.instanceColor!.needsUpdate = true;
    }
    if (baubleMeshRef.current) {
      baubles.forEach((d, i) => baubleMeshRef.current!.setColorAt(i, d.color));
      baubleMeshRef.current.instanceColor!.needsUpdate = true;
    }
    if (lightMeshRef.current) {
      lights.forEach((d, i) => lightMeshRef.current!.setColorAt(i, d.color));
      lightMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [boxes, baubles, lights]);

  // --- ANIMATION LOOP ---
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Smooth transition logic
    // We use a custom lerp factor to make the formation snap a bit faster at the end
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, progress, 0.03);
    const t = currentProgress.current;
    
    // Easing function for position interpolation
    // easeInOutCubic
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    // Helper to update instance
    const updateLayer = (
      mesh: THREE.InstancedMesh, 
      data: OrnamentData[], 
      isLight: boolean = false
    ) => {
      for (let i = 0; i < data.length; i++) {
        const { scatterPos, treePos, rotationSpeed, scale, weight, phase } = data[i];

        // 1. Base Position Interpolation
        dummy.position.lerpVectors(scatterPos, treePos, easedT);

        // 2. Physics / Floating Effect based on Weight
        // Heavy items float less, light items float more
        const floatAmp = (1.0 - weight) * 0.5 + 0.1; // 0.1 to 0.6
        const floatFreq = (1.0 - weight) * 1.0 + 0.5; // Faster for lighter
        
        // In scattered state (t=0), movement is chaotic and wide
        // In tree state (t=1), movement is a gentle breathe
        const scatterMove = Math.sin(time * floatFreq + phase) * floatAmp * 3.0 * (1 - easedT);
        const treeMove = Math.cos(time * 0.5 + phase) * 0.05 * easedT;
        
        dummy.position.y += scatterMove + treeMove;
        dummy.position.x += Math.cos(time * floatFreq * 0.5 + phase) * floatAmp * (1 - easedT);

        // 3. Rotation
        if (!isLight) {
          // Boxes and Baubles spin
          // Spin faster in scatter, align/slow down in tree
          dummy.rotation.x = rotationSpeed.x * time * (2 - easedT);
          dummy.rotation.y = rotationSpeed.y * time * (2 - easedT);
          dummy.rotation.z = rotationSpeed.z * time * (2 - easedT);
          
          // Force upright for boxes in tree mode
          if (data[i].type === 'box') {
             dummy.rotation.x *= (1 - easedT);
             dummy.rotation.z *= (1 - easedT);
          }
        } else {
          // Lights pulsate scale instead of rotating
          const flicker = Math.sin(time * 3 + phase) * 0.2 + 0.8;
          dummy.scale.setScalar(scale * flicker);
        }

        if (!isLight) dummy.scale.setScalar(scale);

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };

    if (boxMeshRef.current) updateLayer(boxMeshRef.current, boxes);
    if (baubleMeshRef.current) updateLayer(baubleMeshRef.current, baubles);
    if (lightMeshRef.current) updateLayer(lightMeshRef.current, lights, true);
  });

  return (
    <group>
      {/* 1. HEAVY: Gift Boxes */}
      <instancedMesh
        ref={boxMeshRef}
        args={[undefined, undefined, boxes.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.3}
          metalness={0.4}
          envMapIntensity={1.0}
        />
      </instancedMesh>

      {/* 2. MEDIUM: Baubles */}
      <instancedMesh
        ref={baubleMeshRef}
        args={[undefined, undefined, baubles.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.1}
          metalness={1.0} // High polish
          envMapIntensity={2.0} // Strong reflections
        />
      </instancedMesh>

      {/* 3. LIGHT: Lights / Stars */}
      <instancedMesh
        ref={lightMeshRef}
        args={[undefined, undefined, lights.length]}
      >
        <dodecahedronGeometry args={[1, 0]} /> 
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffd700"
          emissiveIntensity={3} // High intensity for Bloom
          toneMapped={false} // Allow color to exceed 1.0 for true HDR glow
        />
      </instancedMesh>
    </group>
  );
};
