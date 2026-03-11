import { Schema, type } from '@colyseus/schema';

export class Npc extends Schema {
  constructor() {
    super();
    this.id = '';
    this.x = 0;
    this.y = 0;
    this.hp = 100;
    this.role = ''; // 'human' or 'monster'
    this.isDead = false;
    this.targetId = ''; // chi sta inseguendo
    this.anim = 'stand';
    this.flipX = false;
  }
}

type('string')(Npc.prototype, 'id');
type('number')(Npc.prototype, 'x');
type('number')(Npc.prototype, 'y');
type('number')(Npc.prototype, 'hp');
type('string')(Npc.prototype, 'role');
type('boolean')(Npc.prototype, 'isDead');
type('string')(Npc.prototype, 'targetId');
type('string')(Npc.prototype, 'anim');
type('boolean')(Npc.prototype, 'flipX');
