/**
 * @description Wrapper per Web Serial API — comunicazione con Arduino Joystick.
 *              Protocollo: JSON newline-delimited @ 115200 baud.
 *              Supportato da Chrome/Edge 89+. Non funziona su Firefox/Safari.
 *
 * Formato messaggi Arduino → browser:
 *   {"type":"state","t":4821,"player":1,"axes":{"x":0.47,"y":-0.12},"btns":[1,0,0,1]}
 *   {"type":"config","btns":4,"deadzone":0.05,"rate":20,"player":1,"fw":"1.0.0"}
 *   {"type":"pong","t":13405}
 *   {"type":"error","code":"parse_fail","t":...}
 */

// Dichiarazioni minime per Web Serial API (non incluse di default in TypeScript)
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}
interface Serial {
  requestPort(options?: object): Promise<SerialPort>;
}

type MessageHandler = (msg: Record<string, unknown>) => void;

export class ArduinoSerialBridge {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private buffer: string = '';
  private listeners: Record<string, MessageHandler[]> = {};

  static get isSupported(): boolean {
    return 'serial' in navigator;
  }

  /** Apre il dialog browser per selezionare la porta seriale. Richiede gesto utente. */
  async connect(baudRate = 115200): Promise<void> {
    const serial = (navigator as unknown as { serial: Serial }).serial;
    this.port = await serial.requestPort();
    await this.port.open({ baudRate });

    // Pipeline: porta → TextDecoderStream → reader
    const decoder = new (window as unknown as { TextDecoderStream: new () => TransformStream<Uint8Array, string> }).TextDecoderStream();
    this.port.readable.pipeTo(decoder.writable as unknown as WritableStream<Uint8Array>);
    this.reader = (decoder.readable as unknown as ReadableStream<string>).getReader();
    this.writer = this.port.writable.getWriter() as unknown as WritableStreamDefaultWriter<Uint8Array>;

    this._readLoop();
  }

  async disconnect(): Promise<void> {
    try {
      await this.reader?.cancel();
      await (this.writer as unknown as WritableStreamDefaultWriter<unknown>)?.close?.();
      await this.port?.close();
    } catch { /* ignora errori di chiusura */ }
    this.port = this.reader = this.writer = null;
  }

  private async _readLoop(): Promise<void> {
    try {
      while (true) {
        const result = await this.reader!.read();
        if (result.done) break;
        this.buffer += result.value;
        let nl: number;
        while ((nl = this.buffer.indexOf('\n')) !== -1) {
          const line = this.buffer.slice(0, nl).trim();
          this.buffer = this.buffer.slice(nl + 1);
          if (line) this._dispatch(line);
        }
      }
    } catch (e) {
      console.warn('[ArduinoSerialBridge] read error:', e);
    }
  }

  private _dispatch(line: string): void {
    try {
      const msg = JSON.parse(line) as Record<string, unknown>;
      const type = msg['type'] as string | undefined;
      if (type && this.listeners[type]) {
        this.listeners[type].forEach((fn) => fn(msg));
      }
    } catch { /* ignora JSON malformati */ }
  }

  on(type: string, fn: MessageHandler): this {
    (this.listeners[type] ??= []).push(fn);
    return this;
  }

  async send(obj: Record<string, unknown>): Promise<void> {
    if (!this.writer) return;
    const bytes = new TextEncoder().encode(JSON.stringify(obj) + '\n');
    await this.writer.write(bytes as unknown as Uint8Array);
  }

  // ── Shortcut comandi verso Arduino ────────────────────────────────────────
  getConfig(): Promise<void>                        { return this.send({ cmd: 'get_config' }); }
  setConfig(opts: Record<string, unknown>): Promise<void> { return this.send({ cmd: 'set_config', ...opts }); }
  getState(): Promise<void>                         { return this.send({ cmd: 'get_state' }); }
  ping(): Promise<void>                             { return this.send({ cmd: 'ping', t: performance.now() | 0 }); }
  setPlayer(id: number): Promise<void>              { return this.send({ cmd: 'set_player', id }); }
  rumble(duration = 200, strength = 1.0): Promise<void> { return this.send({ cmd: 'rumble', duration, strength }); }
}