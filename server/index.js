import http from 'http';
import express from 'express';
import cors from 'cors';
import pkg from 'colyseus';
const { Server } = pkg;
import { monitor } from '@colyseus/monitor';
import { GameRoom } from './rooms/GameRoom.js';

const PORT = 2567;
const app = express();

app.use(cors());
app.use(express.json());

// ── Colyseus Monitor ───────────────────────────────────────────────────────
// Visit http://localhost:2567/colyseus to inspect rooms and players
app.use('/colyseus', monitor());

const server = http.createServer(app);

const gameServer = new Server({ server });

// Register room
gameServer.define('game_room', GameRoom);

gameServer.listen(PORT).then(() => {
  console.log(`\n🎮  Colyseus server listening on ws://localhost:${PORT}`);
  console.log(`📊  Monitor available at http://localhost:${PORT}/colyseus\n`);
});
