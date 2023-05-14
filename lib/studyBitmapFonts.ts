import * as BABYLON from 'babylonjs';

const URL_FONT_PNG = 'https://pixijs.io/pixi-react/font/desyrel.png';
const URL_FONT_XML = 'https://pixijs.io/pixi-react/font/desyrel.xml';

export default async function studyBitmapFonts(scene: BABYLON.Scene) {
  console.log(`studyBitmapFonts`);

  const fontName = 'desyrel';

  const assetsManager = new BABYLON.AssetsManager(scene);
  const imageTask = assetsManager.addTextureTask('font img task', URL_FONT_PNG);
  const xmlTask = assetsManager.addTextFileTask('font xml task', URL_FONT_XML);

  function extractCharData(charElement: Element) {
    const id = charElement.getAttribute('id');
    const x = parseInt(charElement.getAttribute('x'), 10);
    const y = parseInt(charElement.getAttribute('y'), 10);
    const width = parseInt(charElement.getAttribute('width'), 10);
    const height = parseInt(charElement.getAttribute('height'), 10);
    const xadvance = parseInt(charElement.getAttribute('xadvance'), 10);
    const xoffset = parseInt(charElement.getAttribute('xoffset'), 10);
    const yoffset = parseInt(charElement.getAttribute('yoffset'), 10);
    const page = parseInt(charElement.getAttribute('page'), 10);
    const letter = parseInt(charElement.getAttribute('letter'), 10);
    return {
      id,
      x,
      y,
      width,
      height,
      xadvance,
      xoffset,
      yoffset,
      page,
      letter
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
  const fontMaterial = new BABYLON.StandardMaterial(
    `font-material-${fontName}`,
    scene
  );
  fontMaterial.diffuseTexture = fontTexture;
  fontMaterial.opacityTexture = fontTexture;
  fontMaterial.useAlphaFromDiffuseTexture = true;
  fontMaterial.emissiveColor = BABYLON.Color3.White();
  fontMaterial.backFaceCulling = false;

  function createGlyphPlane(data: CharData) {
    const { width: textureWidth, height: textureHeight } =
      fontTexture.getSize();
    const { id, x, y, width, height } = data;

    const u0 = x / textureWidth;
    const v0 = 1 - (y + height) / textureHeight;
    const u1 = (x + width) / textureWidth;
    const v1 = 1 - y / textureHeight;

    const plane = BABYLON.MeshBuilder.CreatePlane(
      `plane-${id}`,
      { width, height },
      null
    );

    plane.setVerticesData(
      BABYLON.VertexBuffer.UVKind,
      [u0, v0, u1, v0, u1, v1, u0, v1],
      true
    );

    plane.material = fontMaterial;

    return plane;
  }

  for (const [char, data] of Object.entries(fontData)) {
    const plane = createGlyphPlane(data);
    plane.setEnabled(false); // We'll clone this mesh later, so we can disable the original.
    fontCharacterPlanePrefabs[char] = plane;
  }

  function createTextMeshes(text: string) {
    const meshes: BABYLON.Mesh[] = [];

    let x = -0;
    for (const char of text) {
      const unicode = char.charCodeAt(0).toString();

      if (fontCharacterPlanePrefabs[unicode]) {
        const charMesh = fontCharacterPlanePrefabs[unicode].clone(
          `clone-${unicode}`
        );
        charMesh.setEnabled(true);

        charMesh.position.x = x + fontData[unicode].xoffset;
        charMesh.position.y = -fontData[unicode].yoffset * 0.5;
        x += fontData[unicode].xadvance;

        meshes.push(charMesh);
      }
    }

    return meshes;
  }

  const text = 'Hello, world!';
  const textMeshes = createTextMeshes(text);

  const container = new BABYLON.Mesh('container');
  for (const mesh of textMeshes) {
    mesh.parent = container;
  }

  container.scaling.setAll(.005)
  container.position.z = -1
}
