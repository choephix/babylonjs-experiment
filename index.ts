import './style.css';

import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';

import { VCard } from './experiments/VCard';
import { studyCards } from './experiments/studyCards';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 2,
    8,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  studyCards(scene);
  
  return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
  scene.meshes.forEach(mesh => {
    if (mesh.name.startsWith('card')) {
      mesh.rotation.y += 0.01;
    }
  });
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});
