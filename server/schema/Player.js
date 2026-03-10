import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  constructor() {
    super();
    this.x = 400;
    this.y = 300;
    this.sessionId = '';
    this.anim = 'stand';
    this.flipX = false;
    this.role = '';
    this.isReady = false;
    this.name = '';
    this.hp = 100;
    this.isDead = false;
  }
}

type('number')(Player.prototype, 'x');
type('number')(Player.prototype, 'y');
type('string')(Player.prototype, 'sessionId');
type('string')(Player.prototype, 'anim');
type('boolean')(Player.prototype, 'flipX');
type('string')(Player.prototype, 'role');
type('boolean')(Player.prototype, 'isReady');
type('string')(Player.prototype, 'name');
type('number')(Player.prototype, 'hp');
type('boolean')(Player.prototype, 'isDead');
