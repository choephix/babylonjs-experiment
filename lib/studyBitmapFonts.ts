import * as BABYLON from 'babylonjs';

const URL_FONT_PNG = 'https://pixijs.io/pixi-react/font/desyrel.png';
const URL_FONT_XML = 'https://pixijs.io/pixi-react/font/desyrel.xml';

export default async function studyBitmapFonts(scene: BABYLON.Scene) {
  console.log(`studyBitmapFonts`);

  const assetsManager = new BABYLON.AssetsManager(scene);
  const imageTask = assetsManager.addTextureTask('font img task', URL_FONT_PNG);
  const xmlTask = assetsManager.addTextFileTask('font xml task', URL_FONT_XML);

  function extractCharData(charElement: Element) {
    const x = parseInt(charElement.getAttribute('x'), 10);
    const y = parseInt(charElement.getAttribute('y'), 10);
    const width = parseInt(charElement.getAttribute('width'), 10);
    const height = parseInt(charElement.getAttribute('height'), 10);
    const xadvance = parseInt(charElement.getAttribute('xadvance'), 10);
    const xoffset = parseInt(charElement.getAttribute('xoffset'), 10);
    const yoffset = parseInt(charElement.getAttribute('yoffset'), 10);
    return {
      x,
      y,
      width,
      height,
      xadvance,
      xoffset,
      yoffset,
    };
  }

  type CharData = ReturnType<typeof extractCharData>;
  const fontData = {} as Record<string, CharData>;

  xmlTask.onSuccess = function (task) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(task.text, 'text/xml');

    const chars = xmlDoc.getElementsByTagName('char');
    for (let i = 0; i < chars.length; i++) {
      const charElement = chars[i];

      const id = charElement.getAttribute('id');
      const data = extractCharData(charElement);

      fontData[id] = data;
    }

    console.log({ fontData });
  };

  await assetsManager.loadAsync();

  const fontTexture = imageTask.texture;
  const fontCharacterPlanePrefabs = {} as Record<string, BABYLON.Mesh>;

  for (const [char, data] of Object.entries(fontData)) {
    const material = new BABYLON.StandardMaterial(`material-${char}`, scene);

    // create a new texture for each character to be able to set unique uScale, vScale, uOffset, vOffset
    const charTexture = new BABYLON.Texture(fontTexture.url, scene);
    charTexture.uScale = data.width / fontTexture.getSize().width;
    charTexture.vScale = data.height / fontTexture.getSize().height;
    charTexture.uOffset = data.x / fontTexture.getSize().width;
    charTexture.vOffset =
      1 - (data.y + data.height) / fontTexture.getSize().height;

    //charTexture.hasAlpha = true;

    material.diffuseTexture = charTexture;
    material.opacityTexture = charTexture;
    material.useAlphaFromDiffuseTexture = true;
    material.emissiveColor = BABYLON.Color3.White();
    material.backFaceCulling = false;

    const plane = BABYLON.MeshBuilder.CreatePlane(
      `plane-${char}`,
      { width: data.width, height: data.height },
      scene
    );
    plane.material = material;
    plane.setEnabled(false); // We'll clone this mesh later, so we can disable the original.

    fontCharacterPlanePrefabs[char] = plane;
  }

  function createTextMeshes(text: string) {
    const meshes: BABYLON.Mesh[] = [];

    let x = -100;
    for (const char of text) {
      const unicode = char.charCodeAt(0).toString();

      if (fontCharacterPlanePrefabs[unicode]) {
        const charMesh = fontCharacterPlanePrefabs[unicode].clone(
          `clone-${unicode}`
        );
        charMesh.setEnabled(true);

        charMesh.position.x = x + fontData[unicode].xoffset;
        charMesh.position.y = -fontData[unicode].yoffset * .5;
        x += fontData[unicode].xadvance;

        meshes.push(charMesh);
      }
    }

    return meshes;
  }

  const text = 'Hello, world!';
  const textMeshes = createTextMeshes(text);

  for (const mesh of textMeshes) {
    scene.addMesh(mesh);
  }
}

/**
  // After parsing the font data...

  let cursorX = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charData = fontData[char.charCodeAt(0)];

    // Create a plane for the character
    const plane = BABYLON.MeshBuilder.CreatePlane(
      'charPlane',
      {
        width: charData.width,
        height: charData.height,
        updatable: true,
      },
      scene
    );

    // Create a material for the character
    const material = new BABYLON.StandardMaterial('charMaterial', scene);    
    plane.material = material;

    // Create a texture for the character
    const texture = new BABYLON.Texture(URL_FONT_PNG, scene);
    texture.hasAlpha = true;
    material.diffuseTexture = texture;
    material.emissiveColor = BABYLON.Color3.White();
   
    const textureWidth = fontTexture.getBaseSize().width;
    const textureHeight = fontTexture.getBaseSize().height;

    return;

    // Set the UVs for the texture
    const uvs = new Float32Array([
      charData.x / textureWidth,
      charData.y / textureHeight,
      (charData.x + charData.width) / textureWidth,
      charData.y / textureHeight,
      charData.x / textureWidth,
      (charData.y + charData.height) / textureHeight,
      (charData.x + charData.width) / textureWidth,
      (charData.y + charData.height) / textureHeight,
    ]);
    const vertexData = new BABYLON.VertexData();
    vertexData.uvs = uvs;
    vertexData.applyToMesh(plane, true);

    // Position the plane
    plane.position.x = cursorX + charData.xoffset;
    plane.position.y = charData.yoffset;

    // Move the cursor to the next character
    cursorX += charData.xadvance; 
  }

 */
