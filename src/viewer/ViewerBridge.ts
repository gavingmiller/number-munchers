import Phaser from 'phaser';
import { ViewerScene } from './ViewerScene';

/**
 * Wire all HTML sidebar controls to ViewerScene methods.
 * Call once after the Phaser game is created and the scene is ready.
 */
export function wireControls(game: Phaser.Game): void {
  function scene(): ViewerScene {
    return game.scene.getScene('Viewer') as ViewerScene;
  }

  // Transport buttons
  const btnPlay = document.getElementById('btn-play');
  if (btnPlay) {
    btnPlay.addEventListener('click', () => scene().play());
  }

  const btnPause = document.getElementById('btn-pause');
  if (btnPause) {
    btnPause.addEventListener('click', () => scene().pause());
  }

  const btnStepBack = document.getElementById('btn-step-back');
  if (btnStepBack) {
    btnStepBack.addEventListener('click', () => scene().stepBackward());
  }

  const btnStepFwd = document.getElementById('btn-step-fwd');
  if (btnStepFwd) {
    btnStepFwd.addEventListener('click', () => scene().stepForward());
  }

  // Speed slider
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement | null;
  const speedValue = document.getElementById('speed-value');
  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      const fps = parseInt(speedSlider.value, 10);
      scene().setSpeed(fps);
      if (speedValue) {
        speedValue.textContent = `${fps} fps`;
      }
    });
  }

  // Create range button
  const btnCreateRange = document.getElementById('btn-create-range');
  const definedRangesList = document.getElementById('defined-ranges');
  if (btnCreateRange) {
    btnCreateRange.addEventListener('click', () => {
      const nameInput = document.getElementById('range-name') as HTMLInputElement | null;
      const startInput = document.getElementById('range-start') as HTMLInputElement | null;
      const endInput = document.getElementById('range-end') as HTMLInputElement | null;
      const currentFps = speedSlider ? parseInt(speedSlider.value, 10) : 8;

      const name = nameInput?.value.trim() ?? '';
      const start = startInput ? (parseInt(startInput.value, 10) || 0) : 0;
      const end = endInput ? (parseInt(endInput.value, 10) || 0) : 0;

      if (!name) {
        console.warn('[ViewerBridge] Range name is required');
        return;
      }

      scene().createNamedRange(name, start, end, currentFps);

      // Update defined-ranges list in the UI
      if (definedRangesList) {
        // Remove existing entry with same name
        const existing = definedRangesList.querySelector(`[data-range="${name}"]`);
        if (existing) {
          existing.remove();
        }
        const rangeEl = document.createElement('div');
        rangeEl.setAttribute('data-range', name);
        rangeEl.textContent = `${name}: frames ${start}-${end} @ ${currentFps}fps`;
        definedRangesList.appendChild(rangeEl);
      }

      // Clear inputs
      if (nameInput) nameInput.value = '';
    });
  }
}
