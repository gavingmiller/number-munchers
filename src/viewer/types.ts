// Viewer-specific TypeScript interfaces for the sprite viewer dev tool.

export interface ViewerState {
  selectedSprite: string | null;
  isPlaying: boolean;
  speed: number;
  currentFrame: number;
  totalFrames: number;
}

export interface SpriteListItem {
  name: string;
  type: 'character' | 'troggle';
  hasPNG: boolean;
}
