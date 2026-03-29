import Phaser from 'phaser';
import type { CharacterType, TroggleType } from '../types';
import type { SpriteManifest } from '../sprites/SpriteRegistry';
import { ViewerScene } from './ViewerScene';

const CHARACTERS: CharacterType[] = [
  'claude', 'box', 'axolotl', 'electricmouse', 'marshmallow',
  'robot', 'nyancat', 'pusheen', 'mrpickle',
];

const TROGGLES: TroggleType[] = [
  'reggie', 'fangs', 'squirt', 'ember', 'bonehead',
];

/**
 * Initialize the sidebar DOM with the sprite roster and metadata panel.
 * Wires click handlers to ViewerScene via game.scene.getScene bridge.
 */
export function initSidebar(game: Phaser.Game, manifest: SpriteManifest): void {
  const spriteList = document.getElementById('sprite-list');
  if (!spriteList) {
    console.warn('[Sidebar] #sprite-list element not found');
    return;
  }

  let selectedEl: HTMLElement | null = null;

  function getScene(): ViewerScene {
    return game.scene.getScene('Viewer') as ViewerScene;
  }

  function updateMetadata(name: string, type: 'character' | 'troggle'): void {
    const metadataContent = document.getElementById('metadata-content');
    if (!metadataContent) return;

    const meta = getScene().getMetadata();
    const hasPNG = name in manifest;

    const rows: [string, string][] = [
      ['Name', name],
      ['Type', type],
      ['Has PNG', hasPNG ? 'Yes' : 'No'],
    ];

    if (meta && meta.frameCount > 0) {
      rows.push(['Frame Count', String(meta.frameCount)]);
      rows.push(['Frame Size', `${meta.frameWidth}x${meta.frameHeight}`]);
    }

    metadataContent.innerHTML = rows
      .map(([label, value]) => `
        <div class="meta-row">
          <span class="meta-label">${label}</span>
          <span class="meta-value">${value}</span>
        </div>
      `)
      .join('');
  }

  function selectSprite(el: HTMLElement, name: string, type: 'character' | 'troggle'): void {
    // Remove previous selection
    if (selectedEl) {
      selectedEl.classList.remove('selected');
    }
    el.classList.add('selected');
    selectedEl = el;

    // Render in ViewerScene
    getScene().showCharacter(name, type);

    // Update metadata panel (slight delay to let scene process)
    requestAnimationFrame(() => {
      updateMetadata(name, type);
    });
  }

  function createSpriteItem(
    name: string,
    type: 'character' | 'troggle',
    hasPNG: boolean,
  ): HTMLElement {
    const item = document.createElement('div');
    item.className = 'sprite-item';

    const dot = document.createElement('span');
    dot.className = `sprite-dot${hasPNG ? ' has-png' : ''}`;

    const label = document.createElement('span');
    label.className = 'sprite-name';
    label.textContent = name;

    item.appendChild(dot);
    item.appendChild(label);

    item.addEventListener('click', () => selectSprite(item, name, type));

    return item;
  }

  // Build Characters section
  const charHeader = document.createElement('div');
  charHeader.className = 'section-header';
  charHeader.textContent = `Characters (${CHARACTERS.length})`;
  spriteList.appendChild(charHeader);

  for (const name of CHARACTERS) {
    const hasPNG = name in manifest;
    const item = createSpriteItem(name, 'character', hasPNG);
    spriteList.appendChild(item);
  }

  // Build Troggles section
  const trogHeader = document.createElement('div');
  trogHeader.className = 'section-header';
  trogHeader.textContent = `Troggles (${TROGGLES.length})`;
  spriteList.appendChild(trogHeader);

  for (const name of TROGGLES) {
    const hasPNG = name in manifest;
    const item = createSpriteItem(name, 'troggle', hasPNG);
    spriteList.appendChild(item);
  }
}
