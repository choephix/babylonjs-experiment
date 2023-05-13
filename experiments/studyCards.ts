import * as BABYLON from 'babylonjs';

import { VCard } from './VCard';

const MAX_POSITION_RAND = 3.5;
const EXTRA_CARDS_COUNT = 10;

export function studyCards(scene: BABYLON.Scene) {
  for (let i = 0; i < EXTRA_CARDS_COUNT; i++) {
    const variant = Math.floor(Math.random() * 500);
    const card = new VCard(scene, variant);

    // Assign random position
    const posX = Math.random() * 2 * MAX_POSITION_RAND - MAX_POSITION_RAND; // random number between -5 and 5
    const posY = Math.random() * 2 * MAX_POSITION_RAND - MAX_POSITION_RAND; // random number between -5 and 5
    const posZ = Math.random() * 2 * MAX_POSITION_RAND; // random number between -5 and 5
    card.mesh.position.set(posX, posY, posZ);
  }

  const card = new VCard(scene);

  scene.getEngine().runRenderLoop(() => {
    scene.meshes.forEach((mesh) => {
      if (mesh.name.startsWith('card')) {
        mesh.rotation.y += 0.01;
      }
    });
    scene.render();
  });
}
