import type { SpriteManifestEntry } from '../sprites/SpriteRegistry';
import type { DefinedRange } from './ViewerScene';

/**
 * Convert a File to a base64-encoded string (without the data URL prefix).
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:image/png;base64," prefix
      const base64 = result.split(',')[1] ?? result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Commit a loaded sprite to the project.
 * POSTs the PNG (as base64) + manifest entry to /api/sprite-commit.
 * The Vite dev server plugin writes public/sprites/{name}/sheet.png
 * and updates public/sprites/sprites.json.
 */
export async function commitSprite(
  name: string,
  file: File,
  frameWidth: number,
  frameHeight: number,
  definedRanges: DefinedRange[],
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const pngBase64 = await fileToBase64(file);

  // Build animations from defined ranges
  const animations: SpriteManifestEntry['animations'] = {};
  if (definedRanges.length > 0) {
    for (const range of definedRanges) {
      animations[range.name] = {
        frames: [range.start, range.end],
        frameRate: range.fps,
      };
    }
  } else {
    // Default: single 'idle' frame (frame 0)
    animations['idle'] = { frames: [0, 0] };
  }

  const entry: SpriteManifestEntry = {
    sheet: `${name}/sheet.png`,
    frameWidth,
    frameHeight,
    animations,
  };

  const response = await fetch('/api/sprite-commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pngBase64, manifest: entry }),
  });

  return response.json() as Promise<{ ok: boolean; path?: string; error?: string }>;
}
