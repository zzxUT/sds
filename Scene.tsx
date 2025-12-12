import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { TopStar } from './TopStar';
import { TreeState } from '../types';

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  const progress = treeState === TreeState.TREE_SHAPE ? 1 : 0;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMappingExposure: 1.2 }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={45} />
      
      {/* Controls: restrict angle when in tree mode to keep the grandeur */}
      <OrbitControls 
        enablePan={false}
        minDistance={8}
        maxDistance={25}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.6}
      />

      {/* Lighting: Luxurious Gold & Warmth */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight
        position={[10, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        color="#fff0cc"
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00ff44" distance={20} />
      <pointLight position={[0, 5, 5]} intensity={1.5} color="#ffd700" distance={15} />

      <Suspense fallback={null}>
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        <group position={[0, -2, 0]}>
          <Foliage count={12000} progress={progress} />
          {/* Increased count to support dense lights and baubles */}
          <Ornaments count={600} progress={progress} />
          <TopStar progress={progress} />
        </group>
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Suspense>

      {/* Post Processing for Cinematic Feel */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.7} 
          luminanceSmoothing={0.9} 
          intensity={1.0} 
          mipmapBlur 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>

      {/* Background color wrapper */}
      <color attach="background" args={['#020403']} />
    </Canvas>
  );
};
