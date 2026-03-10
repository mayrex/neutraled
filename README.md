# 🎮 Squad Arena — Phaser + Colyseus Multiplayer Prototype

A minimal multiplayer game built with **Phaser 3** (client) and **Colyseus** (server).

---

## Project Structure

```
project/
├── package.json              # Root scripts (runs both server + client)
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── main.js               # Phaser game bootstrap
│   └── MenuScene.js          # Main menu + connect to server
│   └── WaitingRoomScene.js   # Lobby (waits for 2 players)
│   └── GameScene.js          # Multiplayer arena with WASD/arrow movement
└── server/
    ├── index.js              # Express + Colyseus server entry
    ├── package.json
    ├── rooms/
    │   └── GameRoom.js       # Room logic, player join/leave, movement
    └── schema/
        ├── Player.js         # Colyseus schema: x, y, sessionId
        └── GameState.js      # Colyseus schema: players map, started flag
```

---

## Quick Start

### 1. Install dependencies

```bash
# From project root
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Run both server and client

```bash
npm run dev
```

Or run separately in two terminals:

```bash
# Terminal 1 — server (port 2567)
npm run dev:server

# Terminal 2 — client (port 3000)
npm run dev:client
```

### 3. Play

- Open **two browser tabs** at `http://localhost:3000`
- Click **PLAY** in both tabs
- Once 2 players are connected, the game starts automatically

### 4. Monitor

Visit `http://localhost:2567/colyseus` to see active rooms, connected clients, and state via the Colyseus Monitor.

---

## How It Works

| Feature | Implementation |
|---|---|
| **Client framework** | Phaser 3 (via Vite) |
| **Server framework** | Colyseus 0.15 |
| **State sync** | `@colyseus/schema` — `MapSchema<Player>` |
| **Input** | Client sends `move` messages `{ dx, dy }` |
| **Server authority** | Server validates bounds, updates player position |
| **Room capacity** | Exactly 2 players per room |
| **Game start** | Broadcasts `start_game` when 2nd player joins |
| **Monitor** | `@colyseus/monitor` at `/colyseus` |

---

## Controls

| Key | Action |
|---|---|
| `W` / `↑` | Move up |
| `S` / `↓` | Move down |
| `A` / `←` | Move left |
| `D` / `→` | Move right |

---

## Architecture Notes

- **Server is authoritative**: all movement is processed server-side
- **Client sends intent** (`dx`, `dy` direction), server applies speed + bounds
- **Schema-based sync**: Colyseus automatically diffs and sends only changed fields
- **No client-side prediction** — positions update on server state change (simple prototype approach)
