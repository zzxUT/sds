import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface OrnamentData {
  id: number;
  type: 'box' | 'sphere' | 'star';
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  scale: number;
  color: THREE.Color;
  weight: number; // 0 (light/floating) to 1 (heavy/grounded)
  phase: number; // Random animation offset
}

export interface FoliageUniforms {
  uTime: { value: number };
  uProgress: { value: number };
  uColorPrimary: { value: THREE.Color };
  uColorSecondary: { value: THREE.Color };
}
