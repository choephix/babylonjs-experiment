import './style.css';

import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';

import { VCard } from './VCard';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 2,
    5,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  //const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  const card = new VCard(scene);

  return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
  scene.getMeshByName('card').rotation.y += 0.01;
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});
