import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getConePoint, getRandomSpherePoint } from '../utils/math';

interface FoliageProps {
  count: number;
  progress: number; // 0 to 1 interpolation value
}

const FoliageShaderMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying vec2 vUv;
    varying float vAlpha;
    varying float vRandom;

    // Cubic easing out
    float easeOutCubic(float x) {
      return 1.0 - pow(1.0 - x, 3.0);
    }

    void main() {
      vUv = uv;
      vRandom = aRandom;

      // Add some individual delay based on randomness for the transition
      float localProgress = clamp((uProgress * 1.2) - (aRandom * 0.2), 0.0, 1.0);
      localProgress = easeOutCubic(localProgress);

      vec3 pos = mix(aScatterPos, aTreePos, localProgress);
      
      // Breathing effect
      float breathe = sin(uTime * 2.0 + aRandom * 10.0) * 0.05;
      pos += normalize(pos) * breathe;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = (4.0 * aRandom + 2.0) * (50.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform float uTime;
    varying float vRandom;

    void main() {
      // Circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Soft edge
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      // Twinkle logic
      float twinkle = sin(uTime * 3.0 + vRandom * 20.0);
      float brightness = smoothstep(0.0, 1.0, twinkle);

      // Mix colors
      vec3 finalColor = mix(uColorPrimary, uColorSecondary, brightness * 0.5 + 0.2);
      
      // Add extra brightness boost for bloom
      if (brightness > 0.8) {
        finalColor += vec3(0.5, 0.4, 0.2);
      }

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export const Foliage: React.FC<FoliageProps> = ({ count, progress }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, scatterPositions, randoms } = useMemo(() => {
    const treePositions = new Float32Array(count * 3);
    const scatterPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Generate Tree Position (Cone)
      // We start from bottom (low progress) to top (high progress)
      // To make the tree denser at bottom, we can manipulate the linear distribution
      const p = i / count;
      const treeP = getConePoint(14, 5.5, p, i * 137.5); // Golden angle offset
      
      // Add some noise to tree volume so it's not a perfect surface shell
      treeP.x += (Math.random() - 0.5) * 0.5;
      treeP.z += (Math.random() - 0.5) * 0.5;
      treeP.y += (Math.random() - 0.5) * 0.5;

      treePositions[i * 3] = treeP.x;
      treePositions[i * 3 + 1] = treeP.y - 2; // Center Y
      treePositions[i * 3 + 2] = treeP.z;

      // Generate Scatter Position (Sphere/Galaxy)
      const scatterP = getRandomSpherePoint(18);
      scatterPositions[i * 3] = scatterP.x;
      scatterPositions[i * 3 + 1] = scatterP.y;
      scatterPositions[i * 3 + 2] = scatterP.z;

      randoms[i] = Math.random();
    }

    return { positions: treePositions, scatterPositions, randoms };
  }, [count]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly interpolate the uniform value towards the target prop
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        progress,
        0.05
      );
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColorPrimary: { value: new THREE.Color('#0f4a28') }, // Deep Emerald
    uColorSecondary: { value: new THREE.Color('#d4af37') }, // Gold
  }), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // This is technically unused by shader but needed for raycasting if we wanted it
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={FoliageShaderMaterial.vertexShader}
        fragmentShader={FoliageShaderMaterial.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};