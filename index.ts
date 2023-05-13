import './style.css';

import 'babylonjs-loaders';

import { studyCards } from './lib/studyCards';
import { createBabylonScene } from './lib/createBabylonScene';

function main() {
  const scene = createBabylonScene();

  studyCards(scene);
}

main();
