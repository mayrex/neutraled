import Phaser from 'phaser';
import MenuScene from './MenuScene.js';
import WaitingRoomScene from './WaitingRoomScene.js';
import GameScene from './GameScene.js';
import PreloadScene from './preload.js';
import Scene2 from './scene2.js';
import Scene3 from './scene3.js';
import Scene4 from './scene4.js';
import Scene5 from './scene5.js';
import Scene6 from './scene6.js';
import Scene7 from './scene7.js';
import Scene8 from './scene8.js';
import Scene9 from './scene9.js';
import Scene10 from './scene10.js';
import Scene11 from './scene11.js';
import Scene12 from './scene12.js';
import Scene13 from './scene13.js';
import Scene14 from './scene14.js';
import Scene15 from './scene15.js';
import SceneGameOver from './scene_gameover.js';
import SceneVictory from './scene_victory.js';
import SceneGameWin from './scene_gamewin.js';
import SceneUI from './scene_ui.js';
import SceneCredits from './SceneCredits.js';




import { SerialBridgePlugin } from './lib joystick/SerialBridgePlugin.ts';

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  width: 800,
  height: 600,
  pixelArt: true,
  backgroundColor: '#0a0a0f',
  scene: [PreloadScene, MenuScene, WaitingRoomScene, GameScene, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12, Scene13, Scene14, Scene15, SceneGameOver, SceneVictory, SceneGameWin, SceneUI, SceneCredits],
  plugins: {
    global: [
      {
        key: 'SerialBridgePlugin',
        plugin: SerialBridgePlugin,
        start: true,
        mapping: 'serialBridge',
      },
    ],
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // o 0 se top-down
      debug: false       // opzionale, utile per vedere collisioni
    }
  },
  fps: {
    target: 60,  // massimo FPS desiderato
    forceSetTimeOut: true // se true, usa setTimeout invece di requestAnimationFrame
  }

};

const game = new Phaser.Game(config);

// ==== VIRTUAL TOUCH CONTROLS (SMARTPHONE ADAPTATION) ====
document.addEventListener('DOMContentLoaded', () => {
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  
  if (isTouchDevice) {
    const virtualControls = document.getElementById('virtual-controls');
    if (virtualControls) {
      virtualControls.style.display = 'block';

      // Map DOM element IDs to physical KeyCodes
      const keyMap = {
        'btn-w': 87,   // W
        'btn-s': 83,   // S
        'btn-a': 65,   // A
        'btn-d': 68,   // D
        'btn-enter': 13, // ENTER
        'btn-b': 66    // B
      };

      // Helper function to dispatch native Keyboard Events
      const simulateKey = (keyCode, type) => {
        window.dispatchEvent(new KeyboardEvent(type, {
          keyCode: keyCode,
          which: keyCode,
          code: `Key${String.fromCharCode(keyCode)}`,
          bubbles: true
        }));
      };

      // Assign touch listeners to each virtual button
      Object.keys(keyMap).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            simulateKey(keyMap[btnId], 'keydown');
            if (btnId === 'btn-enter' || btnId === 'btn-b') {
                // Polling tools like JustDown require explicit down->up lifecycle buffers rapidly
                setTimeout(() => simulateKey(keyMap[btnId], 'keyup'), 100);
            }
          });
          btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            simulateKey(keyMap[btnId], 'keyup');
          });
          btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            simulateKey(keyMap[btnId], 'keyup');
          });
        }
      });
    }
  }
});
