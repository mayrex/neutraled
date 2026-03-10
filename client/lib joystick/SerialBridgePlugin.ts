/**
 * @description Phaser Global Plugin per il joystick Arduino via Web Serial API.
 *              Registrato una volta sola nel GameConfig; disponibile in ogni scena
 *              tramite mapping automatico 'serialBridge'.
 *
 * Registry keys (poll-based, leggibili in update()):
 *   'serial.connected' boolean
 *   'serial.axes'      { x: number; y: number }
 *   'serial.btns'      number[]            (0=non premuto, 1=premuto)
 *   'serial.player'    number
 *   'serial.t'         number              (timestamp Arduino ms)
 *
 * game.events emessi (event-driven):
 *   'serial:connected'
 *   'serial:disconnected'
 *   'serial:state'   (msg)
 *   'serial:config'  (msg)
 *   'serial:pong'    (msg)
 *   'serial:error'   (msg)
 */

import Phaser from 'phaser';
import { ArduinoSerialBridge } from './ArduinoSerialBridge';

export class SerialBridgePlugin extends Phaser.Plugins.BasePlugin {
  readonly bridge: ArduinoSerialBridge;
  connected: boolean = false;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
    this.bridge = new ArduinoSerialBridge();
  }

  override start(): void {
    // Inizializza Registry con valori di default
    this.game.registry.set('serial.connected', false);
    this.game.registry.set('serial.axes',      { x: 0, y: 0 });
    this.game.registry.set('serial.btns',      [] as number[]);
    this.game.registry.set('serial.player',    1);
    this.game.registry.set('serial.t',         0);

    // Instrada i messaggi Arduino → Registry + game.events
    this.bridge
      .on('state',  (msg) => this._onState(msg))
      .on('config', (msg) => this._onConfig(msg))
      .on('pong',   (msg) => this.game.events.emit('serial:pong',  msg))
      .on('error',  (msg) => this.game.events.emit('serial:error', msg))
      .on('ack',    (msg) => this.game.events.emit('serial:ack',   msg));
  }

  // ── Connessione ───────────────────────────────────────────────────────────

  /** Apre il dialog browser per selezionare la porta seriale.
   *  DEVE essere chiamato da un gestore di click utente (requisito Web Serial). */
  async connect(baudRate = 115200): Promise<void> {
    await this.bridge.connect(baudRate);
    this.connected = true;
    this.game.registry.set('serial.connected', true);
    // Configura Arduino: 4 bottoni, 50 Hz, deadzone 5%
    await this.bridge.setConfig({ btns: 4, rate: 20, deadzone: 0.05 });
    this.game.events.emit('serial:connected');
  }

  async disconnect(): Promise<void> {
    await this.bridge.disconnect();
    this.connected = false;
    this.game.registry.set('serial.connected', false);
    this.game.events.emit('serial:disconnected');
  }

  // ── Handlers interni ──────────────────────────────────────────────────────

  private _onState(msg: Record<string, unknown>): void {
    const axes   = msg['axes']   as { x: number; y: number } | undefined;
    const btns   = msg['btns']   as number[] | undefined;
    const player = msg['player'] as number | undefined;
    const t      = msg['t']      as number | undefined;

    if (axes)   this.game.registry.set('serial.axes',   axes);
    if (btns)   this.game.registry.set('serial.btns',   btns);
    if (player) this.game.registry.set('serial.player', player);
    if (t)      this.game.registry.set('serial.t',      t);

    this.game.events.emit('serial:state', msg);
  }

  private _onConfig(msg: Record<string, unknown>): void {
    this.game.registry.set('serial.config', msg);
    this.game.events.emit('serial:config', msg);
  }

  // ── Shortcut comandi verso Arduino ────────────────────────────────────────
  setConfig(opts: Record<string, unknown>): Promise<void> { return this.bridge.setConfig(opts); }
  getConfig(): Promise<void>                              { return this.bridge.getConfig(); }
  ping(): Promise<void>                                   { return this.bridge.ping(); }
  rumble(duration = 200, strength = 1.0): Promise<void>  { return this.bridge.rumble(duration, strength); }
  setPlayer(id: number): Promise<void>                   { return this.bridge.setPlayer(id); }

  static get isSupported(): boolean { return ArduinoSerialBridge.isSupported; }
}