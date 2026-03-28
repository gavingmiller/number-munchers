import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT_DIR = join(import.meta.dir, '..', 'assets', 'ios');
mkdirSync(OUT_DIR, { recursive: true });

// Colors matching the game
const BG_COLOR = '#1a1a2e';
const BOX_COLOR = '#44cc44';
const BOX_COLOR_STROKE = '#3ab83a';
const EYE_COLOR = '#000000';
const TITLE_COLOR = '#ffd700';

/** Draw the Box character on a canvas context at the given position and size. */
function drawBox(ctx: any, cx: number, cy: number, boxSize: number): void {
  const half = boxSize / 2;

  // Green square body
  ctx.fillStyle = BOX_COLOR;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(cx - half, cy - half, boxSize, boxSize);
  ctx.globalAlpha = 1.0;

  // Border
  ctx.strokeStyle = BOX_COLOR;
  ctx.lineWidth = Math.max(2, boxSize * 0.04);
  ctx.strokeRect(cx - half, cy - half, boxSize, boxSize);

  // Eyes (two black squares)
  ctx.fillStyle = EYE_COLOR;
  const eyeSize = boxSize * 0.11;
  const eyeY = cy - boxSize * 0.16;
  const eyeSpacing = boxSize * 0.3;
  ctx.fillRect(cx - eyeSpacing - eyeSize / 2, eyeY - eyeSize / 2, eyeSize, eyeSize);
  ctx.fillRect(cx + eyeSpacing - eyeSize / 2, eyeY - eyeSize / 2, eyeSize, eyeSize);

  // Smile (black rectangle)
  ctx.fillStyle = EYE_COLOR;
  const smileW = boxSize * 0.32;
  const smileH = boxSize * 0.07;
  const smileY = cy + boxSize * 0.12;
  ctx.fillRect(cx - smileW / 2, smileY, smileW, smileH);
}

// ── APP ICON (1024x1024) ──
function generateAppIcon(): void {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, size, size);

  // Box character centered — large
  drawBox(ctx, size / 2, size / 2, size * 0.6);

  const buffer = canvas.toBuffer('image/png');
  const path = join(OUT_DIR, 'AppIcon-1024.png');
  writeFileSync(path, buffer);
  console.log(`Generated: ${path}`);
}

// ── SPLASH SCREENS ──
interface SplashSize {
  width: number;
  height: number;
  name: string;
}

const SPLASH_SIZES: SplashSize[] = [
  { width: 1284, height: 2778, name: 'LaunchScreen-1284x2778.png' },   // iPhone 14 Pro Max
  { width: 1170, height: 2532, name: 'LaunchScreen-1170x2532.png' },   // iPhone 14
  { width: 2048, height: 2732, name: 'LaunchScreen-2048x2732.png' },   // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'LaunchScreen-1668x2388.png' },   // iPad Pro 11"
];

function generateSplashScreen(spec: SplashSize): void {
  const { width, height, name } = spec;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Title "NUMBER MUNCHERS" — upper area
  const titleSize = Math.floor(width * 0.07);
  ctx.fillStyle = TITLE_COLOR;
  ctx.font = `bold ${titleSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NUMBER', width / 2, height * 0.28);
  ctx.fillText('MUNCHERS', width / 2, height * 0.28 + titleSize * 1.2);

  // Box character — centered below title
  const boxSize = Math.min(width, height) * 0.25;
  drawBox(ctx, width / 2, height * 0.52, boxSize);

  const buffer = canvas.toBuffer('image/png');
  const path = join(OUT_DIR, name);
  writeFileSync(path, buffer);
  console.log(`Generated: ${path}`);
}

// ── GENERATE ALL ──
console.log('Generating iOS assets...\n');
generateAppIcon();
for (const spec of SPLASH_SIZES) {
  generateSplashScreen(spec);
}
console.log(`\nDone! Assets in: ${OUT_DIR}`);
