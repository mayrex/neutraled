import { Schema, MapSchema, type } from '@colyseus/schema';
import { Player } from './Player.js';
import { Npc } from './Npc.js';

export class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.npcs = new MapSchema();
    this.started = false;
  }
}

type({ map: Player })(GameState.prototype, 'players');
type({ map: Npc })(GameState.prototype, 'npcs');
type('boolean')(GameState.prototype, 'started');
