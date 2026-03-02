import Phaser from 'phaser';
import type { CharacterType } from '../types';
import { COLOR_PLAYER } from '../constants';

/**
 * Draw a character sprite into a container at (0,0) local coords.
 * @param pixelSize — size of each "pixel" block (4 for grid, 6 for preview)
 */
export function drawCharacter(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  character: CharacterType,
  pixelSize: number,
): void {
  switch (character) {
    case 'claude':
      drawClaude(scene, container, pixelSize);
      break;
    case 'axolotl':
      drawAxolotl(scene, container, pixelSize);
      break;
    case 'electricmouse':
      drawElectricMouse(scene, container, pixelSize);
      break;
    case 'marshmallow':
      drawMarshmallow(scene, container, pixelSize);
      break;
    case 'robot':
      drawRobot(scene, container, pixelSize);
      break;
    case 'nyancat':
      drawNyanCat(scene, container, pixelSize);
      break;
    case 'pusheen':
      drawPusheen(scene, container, pixelSize);
      break;
    case 'mrpickle':
      drawMrPickle(scene, container, pixelSize);
      break;
    case 'box':
    default:
      drawBox(scene, container);
      break;
  }
}

/** Helper: fill an array of [col, row] pixels at a given color onto a Graphics object. */
function fillPixels(
  g: Phaser.GameObjects.Graphics,
  pixels: [number, number][],
  color: number,
  P: number,
  ox: number,
  oy: number,
): void {
  g.fillStyle(color, 1);
  for (const [px, py] of pixels) {
    g.fillRect(ox + px * P, oy + py * P, P, P);
  }
}

// ─── CLAUDE ──────────────────────────────────────────
function drawClaude(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();
  const color = 0xc7725a;
  const dark = 0x8b4a3a; // darker shade for eyes

  // Body pixels (terra cotta)
  const body: [number, number][] = [
    // Row 0: top of head
    [4,0],[5,0],[6,0],[7,0],
    // Row 1: head widens
    [3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
    // Row 2: full width with ear nubs
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],
    // Row 3: face — solid fill (no gaps)
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
    // Row 4: lower face
    [2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],
    // Row 5: chin / mouth
    [2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
    // Row 6: body
    [3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
    // Row 7: body
    [3,7],[4,7],[5,7],[6,7],[7,7],[8,7],
    // Row 8: legs
    [3,8],[4,8],[7,8],[8,8],
    // Row 9: feet
    [3,9],[4,9],[7,9],[8,9],
  ];

  // Eyes — dark squares on the face (one pair only)
  const eyes: [number, number][] = [
    [4,3],[5,3],
    [7,3],[8,3],
  ];

  const ox = -(12 * P) / 2;
  const oy = -(10 * P) / 2;
  fillPixels(g, body, color, P, ox, oy);
  fillPixels(g, eyes, dark, P, ox, oy);
  container.add(g);
}

// ─── BOX ─────────────────────────────────────────────
function drawBox(scene: Phaser.Scene, container: Phaser.GameObjects.Container): void {
  const size = 44;
  const rect = scene.add.rectangle(0, 0, size, size, COLOR_PLAYER, 0.85)
    .setStrokeStyle(2, COLOR_PLAYER);
  container.add(rect);

  const g = scene.add.graphics();
  g.fillStyle(0x000000, 1);
  g.fillRect(-9, -7, 5, 5);
  g.fillRect(4, -7, 5, 5);
  g.fillRect(-7, 5, 14, 3);
  container.add(g);
}

// ─── AXOLOTL ─────────────────────────────────────────
function drawAxolotl(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();

  // Colors
  const pink = 0xf5b0c8;
  const darkPink = 0xd65d8c;
  const hotPink = 0xc44488;
  const black = 0x3d1952;

  // 12x12 grid centered
  const ox = -(12 * P) / 2;
  const oy = -(12 * P) / 2;

  // Gill tufts (dark pink)
  const gills: [number, number][] = [
    [0,1],[1,0],[1,1],
    [10,0],[11,1],[10,1],
    [0,3],[0,4],
    [11,3],[11,4],
  ];
  fillPixels(g, gills, hotPink, P, ox, oy);

  // Body (light pink)
  const body: [number, number][] = [
    [4,0],[5,0],[6,0],[7,0],
    [3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
    [2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
    [2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
    [3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
    [3,7],[4,7],[5,7],[6,7],[7,7],[8,7],
    [2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],
    [3,9],[4,9],[7,9],[8,9],
    [3,10],[4,10],[7,10],[8,10],
  ];
  fillPixels(g, body, pink, P, ox, oy);

  // Eyes (dark purple)
  const eyes: [number, number][] = [
    [4,4],[5,4],
    [7,4],[8,4],
  ];
  fillPixels(g, eyes, black, P, ox, oy);

  // Mouth (dark pink)
  const mouth: [number, number][] = [
    [5,6],[6,6],
  ];
  fillPixels(g, mouth, darkPink, P, ox, oy);

  // Cheek blush
  const blush: [number, number][] = [
    [3,5],[8,5],
  ];
  fillPixels(g, blush, darkPink, P, ox, oy);

  container.add(g);
}

// ─── ELECTRIC MOUSE ──────────────────────────────────
function drawElectricMouse(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();

  const yellow = 0xf8d830;
  const darkYellow = 0xe8a830;
  const orange = 0xe07828;
  const black = 0x202020;
  const red = 0xd03030;
  const white = 0xffffff;

  // 12x12 grid centered
  const ox = -(12 * P) / 2;
  const oy = -(12 * P) / 2;

  // Ears (black tips + yellow)
  const earBlack: [number, number][] = [
    [1,0],[2,0],
    [9,0],[10,0],
    [2,1],
    [9,1],
  ];
  fillPixels(g, earBlack, black, P, ox, oy);

  const earYellow: [number, number][] = [
    [1,1],[1,2],[2,2],
    [10,1],[10,2],[9,2],
  ];
  fillPixels(g, earYellow, yellow, P, ox, oy);

  // Head (yellow)
  const head: [number, number][] = [
    [3,2],[4,2],[5,2],[6,2],[7,2],[8,2],
    [2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],
    [2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],
    [2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
    [3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
  ];
  fillPixels(g, head, yellow, P, ox, oy);

  // Eyes (black dots)
  const eyes: [number, number][] = [
    [4,4],
    [7,4],
  ];
  fillPixels(g, eyes, black, P, ox, oy);

  // Eye highlights
  const eyeHighlight: [number, number][] = [
    [4,3],
    [7,3],
  ];
  fillPixels(g, eyeHighlight, white, P, ox, oy);

  // Cheeks (red/orange)
  const cheeks: [number, number][] = [
    [3,5],
    [8,5],
  ];
  fillPixels(g, cheeks, red, P, ox, oy);

  // Mouth
  const mouthPx: [number, number][] = [
    [5,5],[6,5],
  ];
  fillPixels(g, mouthPx, black, P, ox, oy);

  // Body (orange/darker)
  const body: [number, number][] = [
    [4,7],[5,7],[6,7],[7,7],
    [3,8],[4,8],[5,8],[6,8],[7,8],[8,8],
    [3,9],[4,9],[5,9],[6,9],[7,9],[8,9],
    [3,10],[4,10],[7,10],[8,10],
  ];
  fillPixels(g, body, orange, P, ox, oy);

  // Tail (orange + yellow)
  const tailOrange: [number, number][] = [
    [9,6],[10,5],[10,6],
    [10,4],[11,3],[11,4],
  ];
  fillPixels(g, tailOrange, orange, P, ox, oy);

  const tailYellow: [number, number][] = [
    [11,2],
  ];
  fillPixels(g, tailYellow, darkYellow, P, ox, oy);

  // Feet (black)
  const feet: [number, number][] = [
    [3,10],[4,10],[7,10],[8,10],
  ];
  fillPixels(g, feet, black, P, ox, oy);

  container.add(g);
}

// ─── MARSHMALLOW ─────────────────────────────────────
function drawMarshmallow(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();

  const white = 0xe8e8f0;
  const lightGray = 0xc8c8d8;
  const darkBlue = 0x1e2848;
  const eyeHighlight = 0x8888bb;
  const brown = 0x4a3020;
  const blush = 0xe8a0a0;
  const black = 0x202030;

  // 10x12 grid centered — rectangular (taller than wide)
  const ox = -(10 * P) / 2;
  const oy = -(12 * P) / 2;

  // Outline (brown) — rectangular shape
  const rim: [number, number][] = [
    [2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
    [1,1],[8,1],
    [1,10],[8,10],
    [2,11],[3,11],[4,11],[5,11],[6,11],[7,11],
  ];
  fillPixels(g, rim, brown, P, ox, oy);

  // Body (white) — rectangular fill
  const body: [number, number][] = [
    [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],
    [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],
    [1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],
    [1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],
    [2,10],[3,10],[4,10],[5,10],[6,10],[7,10],
  ];
  fillPixels(g, body, white, P, ox, oy);

  // Side shadow (light gray)
  const shadow: [number, number][] = [
    [1,6],[1,7],[1,8],[1,9],
    [8,6],[8,7],[8,8],[8,9],
  ];
  fillPixels(g, shadow, lightGray, P, ox, oy);

  // Eyes (dark blue, 2x2 each)
  const eyeL: [number, number][] = [
    [3,4],[4,4],[3,5],[4,5],
  ];
  const eyeR: [number, number][] = [
    [5,4],[6,4],[5,5],[6,5],
  ];
  fillPixels(g, eyeL, darkBlue, P, ox, oy);
  fillPixels(g, eyeR, darkBlue, P, ox, oy);

  // Eye highlights
  const highlights: [number, number][] = [
    [3,4],
    [5,4],
  ];
  fillPixels(g, highlights, eyeHighlight, P, ox, oy);

  // Mouth
  const mouth: [number, number][] = [
    [4,7],[5,7],
  ];
  fillPixels(g, mouth, black, P, ox, oy);

  // Blush spots
  const blushPx: [number, number][] = [
    [2,6],[3,6],
    [6,6],[7,6],
  ];
  fillPixels(g, blushPx, blush, P, ox, oy);

  // Arms/handles (brown, on sides)
  const arms: [number, number][] = [
    [0,4],[0,5],
    [9,4],[9,5],
  ];
  fillPixels(g, arms, brown, P, ox, oy);

  // Feet (brown)
  const feet: [number, number][] = [
    [3,11],[4,11],[5,11],[6,11],
  ];
  fillPixels(g, feet, brown, P, ox, oy);

  container.add(g);
}

// ─── ROBOT ───────────────────────────────────────────
function drawRobot(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();

  const darkNavy = 0x2d3148;
  const gray = 0x808898;
  const screen = 0x98a8b8;
  const screenLight = 0xb8c8d8;
  const black = 0x181820;

  // 10x14 grid centered
  const ox = -(10 * P) / 2;
  const oy = -(14 * P) / 2;

  // Antenna
  const antenna: [number, number][] = [
    [3,0],[4,0],
    [4,1],
  ];
  fillPixels(g, antenna, black, P, ox, oy);

  // Head outer (dark navy)
  const headOuter: [number, number][] = [
    [2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
    [1,3],[2,3],[7,3],[8,3],
    [1,4],[2,4],[7,4],[8,4],
    [1,5],[2,5],[7,5],[8,5],
    [1,6],[2,6],[7,6],[8,6],
    [1,7],[2,7],[7,7],[8,7],
    [2,8],[3,8],[4,8],[5,8],[6,8],[7,8],
  ];
  fillPixels(g, headOuter, darkNavy, P, ox, oy);

  // Screen (lighter inset)
  const screenPx: [number, number][] = [
    [3,3],[4,3],[5,3],[6,3],
    [3,4],[4,4],[5,4],[6,4],
    [3,5],[4,5],[5,5],[6,5],
    [3,6],[4,6],[5,6],[6,6],
    [3,7],[4,7],[5,7],[6,7],
  ];
  fillPixels(g, screenPx, screen, P, ox, oy);

  // Screen highlight
  const scrHL: [number, number][] = [
    [5,3],[6,3],
    [6,4],
  ];
  fillPixels(g, scrHL, screenLight, P, ox, oy);

  // Eyes on screen (dark)
  const eyes: [number, number][] = [
    [4,5],
    [6,5],
  ];
  fillPixels(g, eyes, black, P, ox, oy);

  // Mouth on screen
  const mouth: [number, number][] = [
    [4,6],[5,6],
  ];
  fillPixels(g, mouth, black, P, ox, oy);

  // Body (gray)
  const body: [number, number][] = [
    [3,9],[4,9],[5,9],[6,9],
    [2,10],[3,10],[4,10],[5,10],[6,10],[7,10],
    [2,11],[3,11],[4,11],[5,11],[6,11],[7,11],
  ];
  fillPixels(g, body, gray, P, ox, oy);

  // Body buttons (dark)
  const buttons: [number, number][] = [
    [4,10],[5,10],
    [4,11],[5,11],
  ];
  fillPixels(g, buttons, darkNavy, P, ox, oy);

  // Legs (dark navy)
  const legs: [number, number][] = [
    [3,12],[4,12],[5,12],[6,12],
  ];
  fillPixels(g, legs, darkNavy, P, ox, oy);

  // Feet (black)
  const robotFeet: [number, number][] = [
    [2,13],[3,13],
    [6,13],[7,13],
  ];
  fillPixels(g, robotFeet, black, P, ox, oy);

  container.add(g);
}

// ─── NYAN CAT ────────────────────────────────────────
function drawNyanCat(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();

  const catGray = 0x666666;
  const darkGray = 0x444444;
  const pink = 0xf0a0c0;
  const poptartTan = 0xf0d8a0;
  const hotPink = 0xe858a0;
  const black = 0x181818;
  const red = 0xff0000;
  const orange = 0xff8800;
  const yellow = 0xffff00;
  const green = 0x00cc00;
  const blue = 0x4488ff;
  const purple = 0x8800cc;

  // 14x10 grid centered (wide — nyan cat is horizontal)
  const ox = -(14 * P) / 2;
  const oy = -(10 * P) / 2;

  // Rainbow trail (left side, 6 colors stacked)
  const rainbowColors = [red, orange, yellow, green, blue, purple];
  for (let i = 0; i < 6; i++) {
    const row = 2 + i;
    const pixels: [number, number][] = [[0,row],[1,row],[2,row]];
    fillPixels(g, pixels, rainbowColors[i], P, ox, oy);
  }

  // Poptart body (tan)
  const poptart: [number, number][] = [
    [3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],
    [3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
    [3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],
    [3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],
    [3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
    [3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],
    [3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],
  ];
  fillPixels(g, poptart, poptartTan, P, ox, oy);

  // Pink frosting (inner)
  const frosting: [number, number][] = [
    [4,2],[5,2],[6,2],[7,2],[8,2],
    [4,3],[5,3],[6,3],[7,3],[8,3],
    [4,4],[5,4],[6,4],[7,4],[8,4],
    [4,5],[5,5],[6,5],[7,5],[8,5],
    [4,6],[5,6],[6,6],[7,6],[8,6],
  ];
  fillPixels(g, frosting, pink, P, ox, oy);

  // Sprinkles
  const sprinkles: [number, number][] = [
    [5,3],[7,3],
    [6,5],
    [5,6],[8,4],
  ];
  fillPixels(g, sprinkles, hotPink, P, ox, oy);

  // Cat head (gray, right side)
  const catHead: [number, number][] = [
    [10,1],[11,1],
    [10,2],[11,2],[12,2],
    [10,3],[11,3],[12,3],
    [10,4],[11,4],[12,4],
    [10,5],[11,5],[12,5],
    [10,6],[11,6],
  ];
  fillPixels(g, catHead, catGray, P, ox, oy);

  // Cat ears
  const ears: [number, number][] = [
    [10,0],[12,0],
  ];
  fillPixels(g, ears, darkGray, P, ox, oy);

  // Cat eyes
  const catEyes: [number, number][] = [
    [11,3],[12,3],
  ];
  fillPixels(g, catEyes, black, P, ox, oy);

  // Cat cheek
  const cheek: [number, number][] = [[12,4]];
  fillPixels(g, cheek, pink, P, ox, oy);

  // Cat mouth
  const catMouth: [number, number][] = [[12,5]];
  fillPixels(g, catMouth, black, P, ox, oy);

  // Cat legs (bottom)
  const catLegs: [number, number][] = [
    [4,8],[5,8],[8,8],[9,8],
  ];
  fillPixels(g, catLegs, darkGray, P, ox, oy);

  // Cat tail (left)
  const tail: [number, number][] = [
    [3,3],[3,4],
  ];
  fillPixels(g, tail, darkGray, P, ox, oy);

  container.add(g);
}

// ─── PUSHEEN ─────────────────────────────────────────
function drawPusheen(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();

  const lightGray = 0xb0b0b0;
  const darkGray = 0x808080;
  const black = 0x202020;
  const outline = 0x303030;

  // 12x9 grid centered (wider than tall, chubby)
  const ox = -(12 * P) / 2;
  const oy = -(9 * P) / 2;

  // Outline
  const border: [number, number][] = [
    [3,0],[4,0],[7,0],[8,0],
    [2,1],[5,1],[6,1],[9,1],
    [1,2],[10,2],
    [0,3],[11,3],
    [0,4],[11,4],
    [0,5],[11,5],
    [0,6],[11,6],
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],
  ];
  fillPixels(g, border, outline, P, ox, oy);

  // Body fill
  const body: [number, number][] = [
    [4,1],[5,1],[6,1],[7,1],[8,1],
    [2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],
    [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],
  ];
  fillPixels(g, body, lightGray, P, ox, oy);

  // Ear inner
  const earInner: [number, number][] = [[3,1],[8,1]];
  fillPixels(g, earInner, darkGray, P, ox, oy);

  // Eyes
  const eyes: [number, number][] = [[4,3],[7,3]];
  fillPixels(g, eyes, black, P, ox, oy);

  // Nose
  const nose: [number, number][] = [[5,4],[6,4]];
  fillPixels(g, nose, black, P, ox, oy);

  // Whisker stripes on forehead
  const stripes: [number, number][] = [[5,2],[7,2],[6,3]];
  fillPixels(g, stripes, darkGray, P, ox, oy);

  // Feet
  const pusheenFeet: [number, number][] = [[2,7],[3,7],[5,7],[6,7],[8,7],[9,7]];
  fillPixels(g, pusheenFeet, darkGray, P, ox, oy);

  // Tail
  const tail: [number, number][] = [[10,5],[11,5],[11,6]];
  fillPixels(g, tail, darkGray, P, ox, oy);

  container.add(g);
}

// ─── MR PICKLE ───────────────────────────────────────
function drawMrPickle(scene: Phaser.Scene, container: Phaser.GameObjects.Container, P: number): void {
  const g = scene.add.graphics();

  const green = 0x5cb85c;
  const darkGreen = 0x3a7a3a;
  const darkerGreen = 0x2a5a2a;
  const white = 0xffffff;
  const black = 0x181818;
  const brown = 0x6b4226;

  // 8x14 grid centered (tall narrow pickle)
  const ox = -(8 * P) / 2;
  const oy = -(14 * P) / 2;

  // Pickle body
  const body: [number, number][] = [
    [3,0],[4,0],
    [2,1],[3,1],[4,1],[5,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],
    [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],
    [1,8],[2,8],[3,8],[4,8],[5,8],[6,8],
    [2,9],[3,9],[4,9],[5,9],
  ];
  fillPixels(g, body, green, P, ox, oy);

  // Dark spots
  const spots: [number, number][] = [
    [3,1],[4,2],
    [2,4],[5,5],
    [3,7],[4,6],
    [2,8],
  ];
  fillPixels(g, spots, darkGreen, P, ox, oy);

  // Darker accent
  const darkAccent: [number, number][] = [[5,3],[2,6]];
  fillPixels(g, darkAccent, darkerGreen, P, ox, oy);

  // Eyes (white with black pupils)
  const eyeWhite: [number, number][] = [[3,3],[5,3]];
  fillPixels(g, eyeWhite, white, P, ox, oy);
  const pupils: [number, number][] = [[3,4],[5,4]];
  fillPixels(g, pupils, black, P, ox, oy);

  // Mouth
  const mouth: [number, number][] = [[3,5],[4,5]];
  fillPixels(g, mouth, black, P, ox, oy);

  // Arms (stick arms)
  const arms: [number, number][] = [[0,5],[0,6],[7,5],[7,6]];
  fillPixels(g, arms, black, P, ox, oy);

  // Legs
  const legs: [number, number][] = [[3,10],[4,10],[3,11],[4,11]];
  fillPixels(g, legs, black, P, ox, oy);

  // Shoes (brown)
  const shoes: [number, number][] = [[2,12],[3,12],[4,12],[5,12],[2,13],[3,13],[4,13],[5,13]];
  fillPixels(g, shoes, brown, P, ox, oy);

  container.add(g);
}
