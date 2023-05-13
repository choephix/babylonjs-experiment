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

  // ... now what?

  // After parsing the font data...
  const fontTexture = imageTask.texture;

  const text = 'Hello, world!';

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
}
