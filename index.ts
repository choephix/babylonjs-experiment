import './style.css';

import 'babylonjs-loaders';

import { createBabylonScene } from './lib/createBabylonScene';

function main() {
  const scene = createBabylonScene();

  import('./lib/studyCards').then((ex) => ex.default(scene));
  //import('./lib/studyBitmapFonts').then((ex) => ex.default(scene));
}

main();
