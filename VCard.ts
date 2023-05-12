import * as BABYLON from 'babylonjs';

export class VCard {
  mesh: BABYLON.Mesh;

  constructor(scene: BABYLON.Scene) {
    this.mesh = new BABYLON.Mesh('card', scene);

    const createLayer = (
      name: string,
      options: {
        textureURL: string;
        additive?: boolean;
        scale?: number;
      },
      backside = false
    ) => {
      const layerMaterial = new BABYLON.BackgroundMaterial(name, scene);
      const layerTexture = new BABYLON.Texture(options.textureURL, scene);

      layerTexture.hasAlpha = true; // enable transparency

      layerMaterial.diffuseTexture = layerTexture;
      layerMaterial.backFaceCulling = false;

      const layer = BABYLON.MeshBuilder.CreatePlane(
        name,
        { width: 1, height: 1 },
        scene
      );
      layer.material = layerMaterial;
      layer.parent = this.mesh;

      if (options.additive) {
        layerMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
      }

      if (options.scale) {
        layer.scaling.setAll(options.scale);
      }

      if (backside) {
        layer.rotation.y = Math.PI;
      }

      layerTexture.onLoadObservable.addOnce(
        (eventData) => {
          const layerTextureSize = layerTexture.getSize();
          layer.scaling.x = layerTextureSize.width / 500;
          layer.scaling.y = layerTextureSize.height / 500;
        }
      )

      return layer;
    };

    for (const [layerName, layerOptions] of Object.entries(layerOptions1)) {
      createLayer(layerName, layerOptions);
    }
    for (const [layerName, layerOptions] of Object.entries(layerOptions2)) {
      createLayer(layerName, layerOptions, true);
    }

    const createTextPlane = (
      text: string,
      name: string,
      position: BABYLON.Vector3,
      size = 1
    ) => {
      const dynamicTexture = new BABYLON.DynamicTexture(
        `${name}Texture`,
        { width: 512, height: 256 },
        scene
      );
      const textureContext = dynamicTexture.getContext() as any;

      const dynamicTextureSize = dynamicTexture.getSize();

      textureContext.clearRect(
        0,
        0,
        dynamicTextureSize.width,
        dynamicTextureSize.height
      );
      textureContext.font = 'bold 80px Arial';
      textureContext.fillStyle = 'white';
      textureContext.textAlign = 'center';
      textureContext.textBaseline = 'middle';
      textureContext.fillText(
        text,
        dynamicTextureSize.width / 2,
        dynamicTextureSize.height / 2
      );

      dynamicTexture.update();
      dynamicTexture.hasAlpha = true;

      const textMaterial = new BABYLON.StandardMaterial(
        `${name}Material`,
        scene
      );
      textMaterial.diffuseTexture = dynamicTexture;
      textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

      const textPlane = BABYLON.MeshBuilder.CreatePlane(
        name,
        { width: size, height: size },
        scene
      );
      textPlane.material = textMaterial;
      textPlane.parent = this.mesh;
      textPlane.position = position;
    };

    createTextPlane('Card Title', 'title', new BABYLON.Vector3(0, 0.7, -0.01));
    createTextPlane('10', 'power', new BABYLON.Vector3(0, -0.7, -0.01));
  }
}

const layerOptions1 = {
  illustration: {
    textureURL:
      'https://undroop.web.app/drimgar-poc/illustration-a/a%20(13).jpg',
  },
  frame: {
    textureURL: 'https://public.cx/drimgar-poc/frame/2.webp',
  },
  blobFx: {
    additive: true,
    textureURL: 'https://undroop-assets.web.app/davinci/basic/blob.webp',
  },
};

const layerOptions2 = {
  illustration: {
    textureURL:
      'https://undroop.web.app/drimgar-poc/illustration-trap/trap%20(16).jpg',
  },
  frame: {
    textureURL: 'https://public.cx/drimgar-poc/frame/2.webp',
  },
  blobFx: {
    additive: true,
    textureURL: 'https://undroop-assets.web.app/davinci/basic/blob.webp',
  },
  bigFx: {
    additive: true,
    textureURL: 'https://public.cx/drimgar-poc/board/boardbg02.webp',
    scale: 4,
  },
};
