# Phaser 3.90 Joystick Library - Web Serial API

Libreria per integrare un joystick Arduino in progetti Phaser 3.90 tramite **Web Serial API**.

## Requisiti

- **Browser**: Chrome 89+ o Edge 89+ (Web Serial API non supportata da Firefox/Safari)
- **Arduino**: Firmware che invia/riceve JSON su seriale (115200 baud)
- **Phaser**: 3.60+ (testato su 3.90)

---

## File inclusi

| File | Descrizione |
|------|-------------|
| `ArduinoSerialBridge.ts` | Wrapper low-level per Web Serial API |
| `SerialBridgePlugin.ts` | Phaser Global Plugin (livello framework) |

---

## Protocollo JSON

### Arduino → Browser (lettura)

Il joystick invia messaggi JSON newline-delimited:

```json
{"type":"state","t":4821,"player":1,"axes":{"x":0.47,"y":-0.12},"btns":[1,0,0,1]}
{"type":"config","btns":4,"deadzone":0.05,"rate":20,"player":1,"fw":"1.0.0"}
{"type":"pong","t":13405}
{"type":"error","code":"parse_fail","t":...}
```

| Campo | Descrizione |
|-------|-------------|
| `type` | `state`, `config`, `pong`, `error` |
| `axes.x`, `axes.y` | -1.0 → +1.0 (sinistra/destra, sopra/sotto) |
| `btns` | Array di 0/1 (0=rilasciato, 1=premuto) |
| `t` | Timestamp Arduino in ms |
| `player` | ID giocatore (per multi-joystick) |

### Browser → Arduino (scrittura)

```json
{"cmd":"get_config"}
{"cmd":"set_config","btns":4,"rate":20,"deadzone":0.05}
{"cmd":"get_state"}
{"cmd":"ping","t":12345}
{"cmd":"set_player","id":1}
{"cmd":"rumble","duration":200,"strength":1.0}
```

---

## Integrazione passo-passo

### 1. Copia i file

Copia `ArduinoSerialBridge.ts` e `SerialBridgePlugin.ts` nella cartella del tuo progetto, ad esempio:

```
src/
  plugins/
    ArduinoSerialBridge.ts
    SerialBridgePlugin.ts
```

### 2. Registra il Plugin nel GameConfig

```typescript
import { SerialBridgePlugin } from './plugins/SerialBridgePlugin';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  plugins: {
    global: [
      {
        key:     'SerialBridgePlugin',   // nome univoco
        plugin:  SerialBridgePlugin,
        start:   true,                   // avvia subito start()
        mapping: 'serialBridge',          // this.serialBridge in ogni scena
      },
    ],
  },
  scene: [MyScene],
};

const game = new Phaser.Game(config);
```

### 3. Connessione (richiede click utente)

Web Serial API richiede un **gesto utente** per aprire il dialog di selezione porta:

```typescript
class MyScene extends Phaser.Scene {
  create() {
    // Pulsante per connettere il joystick
    const btn = this.add.text(100, 100, 'Connetti Joystick', { fontSize: '16px' })
      .setInteractive({ cursor: 'pointer' });

    btn.on('pointerdown', async () => {
      const plugin = this.plugins.get('SerialBridgePlugin') as SerialBridgePlugin;

      if (!SerialBridgePlugin.isSupported) {
        console.warn('Web Serial non supportato');
        return;
      }

      try {
        if (plugin.connected) {
          await plugin.disconnect();
        } else {
          await plugin.connect(); // Apre il dialog browser
        }
      } catch (e) {
        console.error('Errore connessione:', e);
      }
    });

    // Ascolta eventi di connessione
    this.game.events.on('serial:connected', () => {
      console.log('Joystick connesso!');
    });
    this.game.events.on('serial:disconnected', () => {
      console.log('Joystick disconnesso');
    });
  }
}
```

### 4. Lettura dati nel ciclo update()

**Metodo 1: Polling dal Registry** (più semplice)

```typescript
update() {
  if (!this.registry.get('serial.connected')) return;

  const axes = this.registry.get('serial.axes') as { x: number; y: number };
  const btns = this.registry.get('serial.btns') as number[];

  // Movimento con soglia (deadzone)
  const THRESHOLD = 0.3;
  let left = axes.x < -THRESHOLD;
  let right = axes.x > THRESHOLD;
  let up = axes.y < -THRESHOLD;
  let down = axes.y > THRESHOLD;

  // Bottone 0 premuto?
  if (btns[0] === 1) {
    // azione
  }

  // Applica al player...
}
```

**Metodo 2: Event-driven** (più reattivo per azioni)

```typescript
create() {
  this.game.events.on('serial:state', (msg) => {
    const axes = msg.axes as { x: number; y: number };
    const btns = msg.btns as number[];
    // Reagisci immediatamente
  });
}
```

### 5. Rising edge per azioni singole

Per evitare ripetizioni quando un bottone viene tenuto premuto:

```typescript
private lastBtn0 = false;

update() {
  const btns = this.registry.get('serial.btns') as number[];
  if (btns) {
    const btn0 = btns[0] === 1;
    if (btn0 && !this.lastBtn0) {
      // Rising edge: esegui UNA volta
      this.jump();
    }
    this.lastBtn0 = btn0;
  }
}
```

### 6. Inviare comandi all'Arduino

```typescript
const plugin = this.plugins.get('SerialBridgePlugin') as SerialBridgePlugin;

// Vibrazione
await plugin.rumble(200, 1.0); // 200ms, intensità massima

// Cambia giocatore
await plugin.setPlayer(2);

// Ping/latency test
await plugin.ping();

// Modifica configurazione
await plugin.setConfig({ deadzone: 0.1, rate: 30 });
```

---

## Registry Keys

Il plugin espone questi valori globali tramite `this.registry`:

| Key | Tipo | Descrizione |
|-----|------|-------------|
| `serial.connected` | `boolean` | true se connesso |
| `serial.axes` | `{x: number, y: number}` | Assi -1.0 → +1.0 |
| `serial.btns` | `number[]` | Array di 0/1 |
| `serial.player` | `number` | ID giocatore |
| `serial.t` | `number` | Timestamp Arduino |
| `serial.config` | `object` | Config ricevuta da Arduino |

---

## Eventi globali

Ascoltabili da qualsiasi scena tramite `this.game.events.on(...)`:

| Evento | Payload | Quando |
|--------|---------|--------|
| `serial:connected` | - | Connessione stabilita |
| `serial:disconnected` | - | Connessione chiusa |
| `serial:state` | `msg` | Ogni update stato |
| `serial:config` | `msg` | Config ricevuta |
| `serial:pong` | `msg` | Risposta ping |
| `serial:error` | `msg` | Errore da Arduino |

---

## Esempio completo: Player controllato da joystick

```typescript
import Phaser from 'phaser';
import { SerialBridgePlugin } from './plugins/SerialBridgePlugin';

class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private lastBtn0 = false;
  private readonly JOY_THRESHOLD = 0.3;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // Setup connessione joystick
    this.setupJoystick();
  }

  private setupJoystick() {
    const btn = this.add.text(700, 10, '[JOY]', { fontSize: '12px' })
      .setInteractive({ cursor: 'pointer' });

    btn.on('pointerdown', async () => {
      const plugin = this.plugins.get('SerialBridgePlugin') as SerialBridgePlugin;
      if (!plugin) return;

      if (plugin.connected) {
        await plugin.disconnect();
        btn.setText('[JOY]');
      } else {
        await plugin.connect();
        btn.setText('[JOY ON]');
      }
    });
  }

  update() {
    const speed = 200;
    let vx = 0, vy = 0;

    // Keyboard fallback
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      if (cursors.left.isDown) vx = -speed;
      if (cursors.right.isDown) vx = speed;
      if (cursors.up.isDown) vy = -speed;
      if (cursors.down.isDown) vy = speed;
    }

    // Joystick override (se connesso)
    if (this.registry.get('serial.connected')) {
      const axes = this.registry.get('serial.axes') as { x: number; y: number };
      const btns = this.registry.get('serial.btns') as number[];

      if (axes) {
        if (Math.abs(axes.x) > this.JOY_THRESHOLD) vx = axes.x * speed;
        if (Math.abs(axes.y) > this.JOY_THRESHOLD) vy = axes.y * speed;
      }

      // Bottone 0 = jump (rising edge)
      if (btns) {
        const btn0 = btns[0] === 1;
        if (btn0 && !this.lastBtn0) {
          this.player.setVelocityY(-400); // Jump!
        }
        this.lastBtn0 = btn0;
      }
    }

    // Normalizza diagonale
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);
  }
}
```

---

## Note importanti

1. **Web Serial richiede HTTPS** (o localhost per sviluppo)
2. **La connessione deve iniziare da un gesto utente** (click, tap)
3. **Firefox/Safari non supportano Web Serial API** - rileva con `SerialBridgePlugin.isSupported`
4. **La deadzone** è configurabile sia lato Arduino che lato Phaser
5. **Per multi-giocatore** usa `setPlayer(id)` per assegnare ID diversi

---

## Schema Arduino (firmware minimo)

```cpp
#include <ArduinoJson.h>

void setup() {
  Serial.begin(115200);
}

void loop() {
  // Leggi joystick (adattare ai pin reali)
  int x = analogRead(A0);  // 0-1023
  int y = analogRead(A1);

  // Normalizza a -1.0 / +1.0
  float jx = (x - 512) / 512.0;
  float jy = (y - 512) / 512.0;

  // Leggi bottoni
  int btns[4] = {
    digitalRead(2),
    digitalRead(3),
    digitalRead(4),
    digitalRead(5)
  };

  // Invia JSON
  StaticJsonDocument<200> doc;
  doc["type"] = "state";
  doc["t"] = millis();
  doc["player"] = 1;
  doc["axes"]["x"] = jx;
  doc["axes"]["y"] = jy;
  doc["btns"].add(btns[0]);
  doc["btns"].add(btns[1]);
  doc["btns"].add(btns[2]);
  doc["btns"].add(btns[3]);

  serializeJson(doc, Serial);
  Serial.println();

  delay(20); // 50 Hz
}
```

---

## Licenza

MIT - Libero uso in progetti personali e commerciali.