import * as BABYLON from 'babylonjs';

import { loremIpsum } from 'lorem-ipsum';

import html2canvas from 'html2canvas';

function createTitle() {
  return loremIpsum({
    count: 1 + ~~(Math.random() * Math.random() * 9),
    units: 'words',
  })
    .toLowerCase()
    .replace(/\b[a-z](?=[a-z]{2})/g, (letter) => letter.toUpperCase());
}

export class VCard {
  mesh: BABYLON.Mesh;

  constructor(private readonly scene: BABYLON.Scene, variant: number = 13) {
    this.mesh = new BABYLON.Mesh('card');

    const { layerOptions1, layerOptions2 } = getLayersOptions(variant);

    for (const [layerName, layerOptions] of Object.entries(layerOptions1)) {
      this.addLayer(layerName, layerOptions);
    }
    for (const [layerName, layerOptions] of Object.entries(layerOptions2)) {
      this.addLayer(layerName, layerOptions, true);
    }

    this.addTextPlane(
      createTitle(),
      'title',
      new BABYLON.Vector3(0, 0.7, -0.05)
    );
    this.addTextPlane('10', 'power', new BABYLON.Vector3(0, -0.7, -0.05), 2);
  }

  private addLayer(
    name: string,
    options: {
      textureURL: string;
      additive?: boolean;
      scale?: number;
      color?: string;
    },
    backside = false
  ) {
    const layerMaterial = new BABYLON.BackgroundMaterial(name);
    const layerTexture = new BABYLON.Texture(options.textureURL);

    layerTexture.hasAlpha = true; // enable transparency

    layerMaterial.diffuseTexture = layerTexture;
    layerMaterial.backFaceCulling = false;

    const layer = BABYLON.MeshBuilder.CreatePlane(name, {
      width: 1,
      height: 1,
    });
    layer.material = layerMaterial;
    layer.parent = this.mesh;

    if (options.additive) {
      layerMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
    }

    if (options.scale) {
      layer.scaling.setAll(options.scale);
    }

    if (options.color) {
      layerMaterial.useRGBColor = false;
      layerMaterial.primaryColor = BABYLON.Color3.FromHexString(options.color);
    }

    if (backside) {
      layer.rotation.y = Math.PI;
    }

    layerTexture.onLoadObservable.addOnce((eventData) => {
      const layerTextureSize = layerTexture.getSize();

      const newPlane = BABYLON.MeshBuilder.CreatePlane(`${name}_new`, {
        width: layerTextureSize.width / 500,
        height: layerTextureSize.height / 500,
      });
      layer._geometry = newPlane.geometry;
      newPlane._geometry = null;
      newPlane.dispose();

      // layer.scaling.x = layerTextureSize.width / 500;
      // layer.scaling.y = layerTextureSize.height / 500;
    });

    return layer;
  }

  private async addTextPlane(
    text: string,
    name: string,
    position: BABYLON.Vector3,
    size = 1
  ) {
    const div = document.createElement('div');
    div.style.background = 'red';
    div.innerText = text;
    const texture = await createTextureFromDiv(this.scene, div);

    const textMaterial = new BABYLON.StandardMaterial(`${name}Material`);
    textMaterial.diffuseTexture = texture;
    textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    const textPlane = BABYLON.MeshBuilder.CreatePlane(name, {
      width: size,
      height: size,
    });
    textPlane.material = textMaterial;
    textPlane.parent = this.mesh;
    textPlane.position = position;
  }
}

function getLayersOptions(variant: number) {
  const color = BABYLON.Color3.FromHSV(Math.random() * 360, 1, 1);

  const layerOptions1 = {
    illustration: {
      textureURL: `https://undroop.web.app/drimgar-poc/illustration-a/a%20(${variant}).jpg`,
    },
    frame: {
      textureURL: 'https://public.cx/drimgar-poc/frame/2.webp',
    },
    blobFx: {
      additive: true,
      textureURL: 'https://undroop-assets.web.app/davinci/basic/blob.webp',
      scale: 12,
      color: color.toHexString(),
    },
  };

  const layerOptions2 = {
    illustration: {
      textureURL: `https://undroop.web.app/drimgar-poc/illustration-trap/trap%20(${variant}).jpg`,
    },
    frame: {
      textureURL: 'https://public.cx/drimgar-poc/frame/2.webp',
    },
    blobFx: {
      additive: true,
      textureURL: 'https://undroop-assets.web.app/davinci/basic/blob.webp',
      scale: 8,
      color: color.toHexString(),
    },
    bigFx: {
      additive: true,
      textureURL: 'https://undroop-assets.web.app/davinci/toc-nebula/oc.png',
      scale: 0.75,
      color: color.toHexString(),
    },
  };

  return { layerOptions1, layerOptions2 };
}

type _LayersOptions = ReturnType<typeof getLayersOptions>['layerOptions1'] &
  ReturnType<typeof getLayersOptions>['layerOptions2'];
type LayerOptions = _LayersOptions[keyof _LayersOptions];

async function createTextureFromDiv(
  scene: BABYLON.Scene,
  div: HTMLDivElement
): Promise<BABYLON.DynamicTexture> {
  // Create a canvas from the div
  const canvas = await html2canvas(div);

  console.log({ width: canvas.width, height: canvas.height })

  // Create a dynamic texture from the canvas
  const texture = new BABYLON.DynamicTexture(
    'dynamicTexture',
    { width: canvas.width, height: canvas.height },
    scene,
    true
  );
  texture.getContext().drawImage(canvas, 0, 0);

  // Don't forget to update the texture after drawing on it
  texture.update(false);

  return texture;
}
