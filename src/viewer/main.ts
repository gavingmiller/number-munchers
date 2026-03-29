import Phaser from 'phaser';
import type { SpriteManifest } from '../sprites/SpriteRegistry';
import { ViewerScene } from './ViewerScene';
import { initSidebar } from './sidebar';
import { wireControls } from './ViewerBridge';

let _manifest: SpriteManifest = {};

/** Returns the manifest loaded at startup. */
export function getManifest(): SpriteManifest {
  return _manifest;
}

async function init(): Promise<void> {
  // Fetch sprites.json manifest before creating the Phaser game
  _manifest = await fetch('/sprites/sprites.json')
    .then((r) => r.json())
    .catch(() => ({})) as SpriteManifest;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'canvas-container',
    width: 600,
    height: 600,
    backgroundColor: 0x1a1a2e,
    render: {
      pixelArt: true,
      roundPixels: true,
    },
    scene: [ViewerScene],
  };

  const game = new Phaser.Game(config);

  // Wait for game ready before wiring sidebar and controls (scene needs to be created first)
  game.events.once('ready', () => {
    initSidebar(game, _manifest);
    wireControls(game);
  });
}

init();
