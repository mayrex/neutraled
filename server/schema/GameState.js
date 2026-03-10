import { Schema, MapSchema, type } from '@colyseus/schema';
import { Player } from './Player.js';

export class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.started = false;
  }
}

type({ map: Player })(GameState.prototype, 'players');
type('boolean')(GameState.prototype, 'started');
