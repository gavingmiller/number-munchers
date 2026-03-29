import Phaser from 'phaser';
import type { CharacterType, TroggleType } from '../types';
import type { SpriteManifest } from '../sprites/SpriteRegistry';
import { ViewerScene } from './ViewerScene';
import { commitSprite } from './commit';

const CHARACTERS: CharacterType[] = [
  'claude', 'box', 'axolotl', 'electricmouse', 'marshmallow',
  'robot', 'nyancat', 'pusheen', 'mrpickle',
];

const TROGGLES: TroggleType[] = [
  'reggie', 'fangs', 'squirt', 'ember', 'bonehead',
];

/** Module-level state: the last File loaded by drop or picker. Accessed by wireCommitButton. */
let _currentFile: File | null = null;

/** Returns the last PNG file loaded via drop or file picker. */
export function getCurrentFile(): File | null {
  return _currentFile;
}

/**
 * Set up drag-and-drop on the canvas container div.
 * Validates the dropped file is PNG before calling onFile.
 */
export function setupDropZone(canvasContainer: HTMLElement, onFile: (file: File) => void): void {
  canvasContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    canvasContainer.classList.add('dragover');
  });

  canvasContainer.addEventListener('dragleave', () => {
    canvasContainer.classList.remove('dragover');
  });

  canvasContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    canvasContainer.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file && file.type === 'image/png') {
      onFile(file);
    } else if (file) {
      console.warn('[Sidebar] Dropped file is not a PNG:', file.type);
    }
  });
}

/**
 * Initialize the sidebar DOM with the sprite roster and metadata panel.
 * Wires click handlers to ViewerScene via game.scene.getScene bridge.
 * Also wires drag-and-drop and file picker for PNG loading.
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

  function getFrameWidth(): number {
    const el = document.getElementById('frame-width') as HTMLInputElement | null;
    return el ? (parseInt(el.value, 10) || 64) : 64;
  }

  function getFrameHeight(): number {
    const el = document.getElementById('frame-height') as HTMLInputElement | null;
    return el ? (parseInt(el.value, 10) || 64) : 64;
  }

  function onFileLoaded(file: File): void {
    _currentFile = file;
    getScene().loadSpritesheet(file, getFrameWidth(), getFrameHeight());
    // Update metadata panel after load completes (slight delay for scene)
    setTimeout(() => {
      const metadataContent = document.getElementById('metadata-content');
      if (!metadataContent) return;
      const meta = getScene().getMetadata();
      if (meta) {
        metadataContent.innerHTML = [
          ['Name', meta.name],
          ['Type', 'external PNG'],
          ['Frame Count', String(meta.frameCount)],
          ['Frame Size', `${meta.frameWidth}x${meta.frameHeight}`],
        ].map(([label, value]) => `
          <div class="meta-row">
            <span class="meta-label">${label}</span>
            <span class="meta-value">${value}</span>
          </div>
        `).join('');
      }
    }, 300);
  }

  // Set up drag-and-drop on canvas container
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) {
    setupDropZone(canvasContainer, onFileLoaded);
  }

  // Wire file picker button
  const btnFilePick = document.getElementById('btn-file-pick');
  if (btnFilePick) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png,image/png';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    btnFilePick.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) {
        onFileLoaded(file);
        // Reset input so the same file can be re-picked
        fileInput.value = '';
      }
    });
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

    // Animation state buttons
    const animList = document.getElementById('animation-list');
    if (animList) {
      const animNames = getScene().getAnimationNames();
      if (animNames.length > 0) {
        animList.innerHTML = `<div class="meta-row"><span class="meta-label">Animations</span></div>` +
          animNames.map((animName) => `
            <button class="anim-btn" data-anim="${animName}">${animName}</button>
          `).join('');
        animList.querySelectorAll('.anim-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const animName = (btn as HTMLElement).dataset.anim!;
            getScene().playAnimation(animName);
            // Highlight active
            animList.querySelectorAll('.anim-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });
      } else {
        animList.innerHTML = '';
      }
    }
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

  // Wire commit button
  const btnCommit = document.getElementById('btn-commit') as HTMLButtonElement | null;
  if (btnCommit) {
    btnCommit.addEventListener('click', async () => {
      const statusEl = document.getElementById('commit-status');
      const nameInput = document.getElementById('commit-name') as HTMLInputElement | null;
      const spriteName = nameInput?.value.trim() ?? '';

      if (!spriteName) {
        if (statusEl) {
          statusEl.textContent = 'Enter a sprite name first.';
          statusEl.className = 'error';
        }
        return;
      }

      if (!_currentFile) {
        if (statusEl) {
          statusEl.textContent = 'Load a PNG first.';
          statusEl.className = 'error';
        }
        return;
      }

      btnCommit.disabled = true;
      if (statusEl) {
        statusEl.textContent = 'Committing...';
        statusEl.className = '';
      }

      try {
        const result = await commitSprite(
          spriteName,
          _currentFile,
          getFrameWidth(),
          getFrameHeight(),
          getScene().getDefinedRanges(),
        );

        if (result.ok) {
          if (statusEl) {
            statusEl.textContent = `Committed ${spriteName} to public/sprites/${spriteName}/`;
            statusEl.className = 'success';
          }
        } else {
          if (statusEl) {
            statusEl.textContent = `Error: ${result.error ?? 'Unknown error'}`;
            statusEl.className = 'error';
          }
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = `Error: ${String(err)}`;
          statusEl.className = 'error';
        }
      } finally {
        btnCommit.disabled = false;
      }
    });
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
