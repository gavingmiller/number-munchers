import Phaser from 'phaser';
import type { TroggleType } from '../types';
import { TROGGLE_COLORS } from '../constants';

/**
 * Draw a troggle sprite into a container at the given pixel scale.
 * Each troggle type gets its own pixel art; unimplemented types
 * fall back to a colored rectangle placeholder.
 */
export function drawTroggle(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  type: TroggleType,
  P: number,
): void {
  switch (type) {
    case 'reggie':
      drawReggie(scene, container, P);
      break;
    case 'ember':
      drawEmber(scene, container, P);
      break;
    case 'fangs':
      drawFangs(scene, container, P);
      break;
    case 'squirt':
      drawSquirt(scene, container, P);
      break;
    case 'bonehead':
      drawBonehead(scene, container, P);
      break;
    default:
      drawPlaceholder(scene, container, type, P);
      break;
  }
}

/** Helper to batch-draw pixels of one color. */
function fillPixels(
  g: Phaser.GameObjects.Graphics,
  pixels: [number, number][],
  color: number,
  P: number,
  oX: number,
  oY: number,
): void {
  g.fillStyle(color);
  for (const [col, row] of pixels) {
    g.fillRect(oX + col * P, oY + row * P, P, P);
  }
}

/** Ember — boxy fireball with flame border, 2 eyes, wide grin */
function drawEmber(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  P: number,
): void {
  const W = 10;
  const H = 12;
  const oX = -(W * P) / 2;
  const oY = -(H * P) / 2;
  const g = scene.add.graphics();

  // Red-orange flame tips (outer edge)
  const tips: [number, number][] = [
    [2,0],[7,0],
    [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
    [0,2],[9,2],
    [0,3],[9,3],
    [0,4],[9,4],
    [0,5],[9,5],
    [0,6],[9,6],
    [0,7],[9,7],
    [0,8],[9,8],
    [0,9],[9,9],
    [1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],
    [3,11],[4,11],[5,11],[6,11],
  ];
  fillPixels(g, tips, 0xe85d04, P, oX, oY);

  // Orange border
  const orange: [number, number][] = [
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],
    [1,3],[8,3],
    [1,4],[8,4],
    [1,5],[8,5],
    [1,6],[8,6],
    [1,7],[8,7],
    [1,8],[8,8],
    [1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],
  ];
  fillPixels(g, orange, 0xf48c06, P, oX, oY);

  // Yellow-orange body (main fill)
  const body: [number, number][] = [
    [2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    [2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
    [2,5],[4,5],[5,5],[7,5],
    [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],
    [2,7],[7,7],
    [2,8],[3,8],[4,8],[5,8],[6,8],[7,8],
  ];
  fillPixels(g, body, 0xfaa307, P, oX, oY);

  // Dark pixels — 2 eyes + wide mouth
  const dark: [number, number][] = [
    [3,5],[6,5],
    [3,7],[4,7],[5,7],[6,7],
  ];
  fillPixels(g, dark, 0x1a1a1a, P, oX, oY);

  container.add(g);
}

// TODO: Snake sprite should change view perspective based on movement direction (up, left, right, down)
/** Fangs — green snake with large head, eyes, forked red tongue, coiled body */
function drawFangs(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  P: number,
): void {
  const W = 10;
  const H = 12;
  const oX = -(W * P) / 2;
  const oY = -(H * P) / 2;
  const g = scene.add.graphics();

  // Main green body
  const green: [number, number][] = [
    [3,0],[4,0],[5,0],[6,0],
    [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
    [1,2],[4,2],[5,2],[8,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],
    [2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
    [3,5],[6,5],
    [3,7],[4,7],[5,7],[6,7],
    [4,8],[5,8],
    [3,9],[6,9],
    [4,10],[5,10],
  ];
  fillPixels(g, green, 0x44aa44, P, oX, oY);

  // Dark green scales
  const scales: [number, number][] = [
    [2,7],[7,7],
    [3,8],[6,8],
    [2,9],[4,9],[5,9],[7,9],
    [3,10],[6,10],
    [4,11],[5,11],
  ];
  fillPixels(g, scales, 0x2d7a2d, P, oX, oY);

  // White eye background
  const white: [number, number][] = [
    [2,2],[7,2],
  ];
  fillPixels(g, white, 0xffffff, P, oX, oY);

  // Dark pupils
  const dark: [number, number][] = [
    [3,2],[6,2],
  ];
  fillPixels(g, dark, 0x1a1a1a, P, oX, oY);

  // Red forked tongue
  const tongue: [number, number][] = [
    [4,5],[5,5],
    [3,6],[6,6],
  ];
  fillPixels(g, tongue, 0xee2222, P, oX, oY);

  container.add(g);
}

/** Bonehead — hooded skull with dark cloak, white face, 2 eye sockets, wide mouth */
function drawBonehead(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  P: number,
): void {
  const W = 10;
  const H = 12;
  const oX = -(W * P) / 2;
  const oY = -(H * P) / 2;
  const g = scene.add.graphics();

  // Dark hood/cloak
  const hood: [number, number][] = [
    [3,0],[4,0],[5,0],[6,0],
    [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],
    [1,3],[8,3],
    [0,4],[1,4],[8,4],[9,4],
    [0,5],[1,5],[8,5],[9,5],
    [0,6],[1,6],[8,6],[9,6],
    [1,7],[8,7],
    [1,8],[2,8],[7,8],[8,8],
    [2,9],[3,9],[4,9],[5,9],[6,9],[7,9],
    [3,10],[4,10],[5,10],[6,10],
    [4,11],[5,11],
  ];
  fillPixels(g, hood, 0x4a4a5a, P, oX, oY);

  // White skull face
  const face: [number, number][] = [
    [2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    [2,4],[4,4],[5,4],[7,4],
    [2,5],[3,5],[4,5],[5,5],[6,5],[7,5],
    [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],
    [2,7],[7,7],
    [3,8],[4,8],[5,8],[6,8],
  ];
  fillPixels(g, face, 0xe8e8e8, P, oX, oY);

  // Dark features — eyes + mouth
  const dark: [number, number][] = [
    [3,4],[6,4],
    [3,7],[4,7],[5,7],[6,7],
  ];
  fillPixels(g, dark, 0x1a1a1a, P, oX, oY);

  container.add(g);
}

/** Squirt — blue water droplet / slime blob with two cute eyes */
function drawSquirt(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  P: number,
): void {
  const W = 10;
  const H = 12;
  const oX = -(W * P) / 2;
  const oY = -(H * P) / 2;
  const g = scene.add.graphics();

  // Dark blue outline / shadow
  const outline: [number, number][] = [
    [4,0],[5,0],
    [3,1],[6,1],
    [2,2],[7,2],
    [1,3],[8,3],
    [1,4],[8,4],
    [0,5],[9,5],
    [0,6],[9,6],
    [0,7],[9,7],
    [0,8],[9,8],
    [0,9],[9,9],
    [1,10],[8,10],
    [2,11],[3,11],[4,11],[5,11],[6,11],[7,11],
  ];
  fillPixels(g, outline, 0x2a5480, P, oX, oY);

  // Main blue body
  const body: [number, number][] = [
    [4,1],[5,1],
    [3,2],[4,2],[5,2],[6,2],
    [2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    [2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],
    [1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],
    [1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],
    [1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],
    [2,10],[3,10],[4,10],[5,10],[6,10],[7,10],
  ];
  fillPixels(g, body, 0x4a8abf, P, oX, oY);

  // Light blue highlight (top-left area for shine)
  const highlight: [number, number][] = [
    [3,3],[4,3],
    [2,4],[3,4],
    [1,5],[2,5],
    [1,6],[2,6],
  ];
  fillPixels(g, highlight, 0x7cb8e4, P, oX, oY);

  // Dark eyes
  const eyes: [number, number][] = [
    [3,7],[4,7],
    [6,7],[7,7],
  ];
  fillPixels(g, eyes, 0x1a1a2e, P, oX, oY);

  // White eye shine
  const shine: [number, number][] = [
    [3,6],
    [6,6],
  ];
  fillPixels(g, shine, 0xffffff, P, oX, oY);

  container.add(g);
}

/** Reggie — purple snail with spiral shell, pink body, two antennae */
function drawReggie(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  P: number,
): void {
  const W = 12;
  const H = 12;
  const oX = -(W * P) / 2;
  const oY = -(H * P) / 2;
  const g = scene.add.graphics();

  // Antennae stalks (dark)
  const stalks: [number, number][] = [
    [2,0],[4,0],
    [2,1],[4,1],
    [2,2],[4,2],
  ];
  fillPixels(g, stalks, 0x3a3a4a, P, oX, oY);

  // Antenna tips (small balls)
  const tips: [number, number][] = [
    [1,0],[3,0],
  ];
  fillPixels(g, tips, 0x3a3a4a, P, oX, oY);

  // Pink/light body (left side — head and foot)
  const body: [number, number][] = [
    [1,3],[2,3],[3,3],[4,3],
    [0,4],[1,4],[2,4],[3,4],[4,4],
    [0,5],[1,5],[2,5],[3,5],[4,5],
    [0,6],[1,6],[2,6],[3,6],[4,6],
    [0,7],[1,7],[2,7],[3,7],[4,7],
    [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
    [0,9],[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9],
    [1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],
  ];
  fillPixels(g, body, 0xc9a8bf, P, oX, oY);

  // Lighter belly/underside
  const belly: [number, number][] = [
    [1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],
    [2,10],[3,10],[4,10],[5,10],[6,10],[7,10],
  ];
  fillPixels(g, belly, 0xd9bccf, P, oX, oY);

  // Purple shell (outer)
  const shell: [number, number][] = [
    [6,3],[7,3],[8,3],
    [5,4],[6,4],[7,4],[8,4],[9,4],
    [5,5],[6,5],[7,5],[8,5],[9,5],[10,5],
    [5,6],[6,6],[7,6],[8,6],[9,6],[10,6],
    [5,7],[6,7],[7,7],[8,7],[9,7],[10,7],
    [6,8],[7,8],[8,8],[9,8],
  ];
  fillPixels(g, shell, 0x7a5ea8, P, oX, oY);

  // Darker purple shell spiral
  const spiral: [number, number][] = [
    [7,4],[8,4],
    [9,5],
    [9,6],
    [8,7],[9,7],
    [7,6],[8,6],
    [7,5],
  ];
  fillPixels(g, spiral, 0x5a3e88, P, oX, oY);

  // Shell highlight (lighter center)
  const shellHighlight: [number, number][] = [
    [6,5],[6,6],
    [7,5],
  ];
  fillPixels(g, shellHighlight, 0x9a7ec8, P, oX, oY);

  // Eye (on the head)
  const eye: [number, number][] = [
    [2,5],[3,5],
  ];
  fillPixels(g, eye, 0xffffff, P, oX, oY);

  // Pupil
  const pupil: [number, number][] = [
    [3,5],
  ];
  fillPixels(g, pupil, 0x1a1a2e, P, oX, oY);

  container.add(g);
}

/** Colored rectangle fallback for troggle types without pixel art yet. */
function drawPlaceholder(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  type: TroggleType,
  P: number,
): void {
  const size = 10 * P;
  const color = TROGGLE_COLORS[type] ?? 0xcc4444;
  const rect = scene.add.rectangle(0, 0, size, size, color, 0.8)
    .setStrokeStyle(2, color);
  container.add(rect);
}
