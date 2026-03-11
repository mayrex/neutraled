import { DEBUG } from './debugConfig.js';

// Log immediato (fuori da update)
export function dbg(level, topic, tag, ...args) {
  if (!DEBUG.level || level > DEBUG.level) return;
  if (!DEBUG[topic]) return;
  const fn = level === 1 ? console.error : level === 2 ? console.warn : console.log;
  fn(`[${tag}]`, ...args);
}

// Log throttlato (da usare in update())
// scene: riferimento alla Phaser.Scene corrente (per il timestamp)
// key:   stringa univoca per identificare il canale throttle
export function dbgUpdate(scene, key, topic, tag, ...args) {
  if (!DEBUG.level || DEBUG.level < 4) return;   // update logs solo in VERBOSE
  if (!DEBUG[topic]) return;
  if (!scene.__dbgT) scene.__dbgT = {};
  const now = scene.time?.now ?? performance.now();
  if ((scene.__dbgT[key] ?? 0) > now) return;
  scene.__dbgT[key] = now + DEBUG.updateThrottleMs;
  console.log(`[${tag}]`, ...args);
}
