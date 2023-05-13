import * as BABYLON from 'babylonjs';

export function createBabylonScene() {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const engine = new BABYLON.Engine(canvas, true);
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

  window.addEventListener('resize', () => {
    engine.resize();
  });

  return scene;
}
