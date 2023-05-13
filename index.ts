import './style.css';

import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';

import { VCard } from './VCard';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true });

const MAX_POSITION_RAND = 3.5;
const EXTRA_CARDS_COUNT = 0; // 10

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

  for (let i = 0; i < EXTRA_CARDS_COUNT; i++) {
    const variant = Math.floor(Math.random() * 500);
    const card = new VCard(scene, variant);

    // Assign random position
    const posX = Math.random() * 2 * MAX_POSITION_RAND - MAX_POSITION_RAND; // random number between -5 and 5
    const posY = Math.random() * 2 * MAX_POSITION_RAND - MAX_POSITION_RAND; // random number between -5 and 5
    const posZ = Math.random() * 2 * MAX_POSITION_RAND; // random number between -5 and 5
    card.mesh.position.set(posX, posY, posZ);

    // Assign random size
    // const size = Math.random() * 0.75 + 0.25; // random number between 0.25 and 1
    // card.mesh.scaling.set(size, size, size);

    //card.mesh.scaling.set(.5,.5,.5);

    //card.mesh.rotation.y = Math.PI * Math.random();
  }

  const card = new VCard(scene);

  return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
  scene.meshes.forEach((mesh) => {
    if (mesh.name.startsWith('card')) {
      mesh.rotation.y += 0.01;
    }
  });
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});
