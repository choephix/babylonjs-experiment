import * as BABYLON from 'babylonjs';

export class VCard {
  mesh: BABYLON.Mesh;

  constructor(private readonly scene: BABYLON.Scene, variant: number = 13) {
    this.mesh = new BABYLON.Mesh('card', scene);

    const { layerOptions1, layerOptions2 } = getLayersOptions(variant);

    for (const [layerName, layerOptions] of Object.entries(layerOptions1)) {
      this.createLayer(layerName, layerOptions);
    }
    for (const [layerName, layerOptions] of Object.entries(layerOptions2)) {
      this.createLayer(layerName, layerOptions, true);
    }

    this.createTextPlane(
      'Card Title',
      'title',
      new BABYLON.Vector3(0, 0.7, -0.05)
    );
    this.createTextPlane('10', 'power', new BABYLON.Vector3(0, -0.7, -0.05), 2);
  }

  private createLayer(
    name: string,
    options: {
      textureURL: string;
      additive?: boolean;
      scale?: number;
      color?: string;
    },
    backside = false
  ) {
    const layerMaterial = new BABYLON.BackgroundMaterial(name, this.scene);
    const layerTexture = new BABYLON.Texture(options.textureURL, this.scene);

    layerTexture.hasAlpha = true; // enable transparency

    layerMaterial.diffuseTexture = layerTexture;
    layerMaterial.backFaceCulling = false;

    const layer = BABYLON.MeshBuilder.CreatePlane(
      name,
      { width: 1, height: 1 },
      this.scene
    );
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

      const newPlane = BABYLON.MeshBuilder.CreatePlane(
        `${name}_new`,
        {
          width: layerTextureSize.width / 500,
          height: layerTextureSize.height / 500,
        },
        this.scene
      );
      layer._geometry = newPlane.geometry;
      newPlane._geometry = null;
      newPlane.dispose();

      // layer.scaling.x = layerTextureSize.width / 500;
      // layer.scaling.y = layerTextureSize.height / 500;
    });

    return layer;
  }

  private createTextPlane(
    text: string,
    name: string,
    position: BABYLON.Vector3,
    size = 1
  ) {
    const dynamicTexture = new BABYLON.DynamicTexture(
      `${name}Texture`,
      { width: 512, height: 256 },
      this.scene
    );
    const textureContext =
      dynamicTexture.getContext() as CanvasRenderingContext2D;

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
      this.scene
    );
    textMaterial.diffuseTexture = dynamicTexture;
    textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    const textPlane = BABYLON.MeshBuilder.CreatePlane(
      name,
      { width: size, height: size },
      this.scene
    );
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
      scale: .75,
      color: color.toHexString(),
    },
  };

  return { layerOptions1, layerOptions2 };
}

type _LayersOptions = ReturnType<typeof getLayersOptions>['layerOptions1'] &
  ReturnType<typeof getLayersOptions>['layerOptions2'];
type LayerOptions = _LayersOptions[keyof _LayersOptions];
