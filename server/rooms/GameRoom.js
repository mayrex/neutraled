import pkg from 'colyseus';
const { Room } = pkg;
import { GameState } from '../schema/GameState.js';
import { Player } from '../schema/Player.js';

// Arena bounds
const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 3200;
const WORLD_MARGIN = 50;

const HUMAN_NAMES = ['Alex', 'Sarah', 'John', 'Emma', 'Mike', 'Lisa'];
const MONSTER_NAMES = ['Gothmog', 'Zorblax', 'Mordrok', 'Xythar', 'Gruumsh', 'Vorg'];

export class GameRoom extends Room {
  onCreate(options) {
    this.setState(new GameState());
    this.maxClients = 2; // Keep at 2 players as requested

    console.log(`[GameRoom] Room created: ${this.roomId}`);

    this.onMessage('MSG_PLAYER_POSITION', (client, data) => {
        const player = this.state.players.get(client.sessionId);
        if (!player || !this.state.started || player.isDead) return;

        // Clamp to world bounds
        player.x = Math.max(WORLD_MARGIN, Math.min(WORLD_WIDTH - WORLD_MARGIN, data.x));
        player.y = Math.max(WORLD_MARGIN, Math.min(WORLD_HEIGHT - WORLD_MARGIN, data.y));
        player.anim = data.anim !== undefined ? data.anim : player.anim;
        player.flipX = data.flipX !== undefined ? data.flipX : player.flipX;
    });

    this.onMessage('set_role', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && !this.state.started) {
        player.role = data.role;
        // Assign random name based on role
        if (player.role === 'human') {
            player.name = HUMAN_NAMES[Math.floor(Math.random() * HUMAN_NAMES.length)];
        } else if (player.role === 'monster') {
            player.name = MONSTER_NAMES[Math.floor(Math.random() * MONSTER_NAMES.length)];
        }
        
        console.log(`[GameRoom] ${client.sessionId} selected role: ${player.role} with name ${player.name}`);
        player.isReady = false;
      }
    });

    this.onMessage('set_ready', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && !this.state.started) {
        player.isReady = !!data.ready;
        console.log(`[GameRoom] ${client.sessionId} ready status: ${player.isReady}`);
        this.checkAllReady();
      }
    });

    // --- Weapon Mechanics ---
    this.onMessage('shoot', (client, data) => {
        const player = this.state.players.get(client.sessionId);
        if (!player || !this.state.started || player.isDead) return;
        
        // Broadcast the projectile to everyone EXCEPT the shooter
        // so they can render it
        this.broadcast("player_shoot", {
            sessionId: client.sessionId,
            weaponType: data.weaponType, // 1 or 2
            x: data.x,
            y: data.y,
            vx: data.vx,
            vy: data.vy
        }, { except: client });
    });

    this.onMessage('transform', (client, data) => {
        const player = this.state.players.get(client.sessionId);
        if (!player || !this.state.started) return;
        // Relay la trasformazione a tutti gli altri client
        this.broadcast('player_transform', {
            sessionId: client.sessionId,
            mode: data.mode
        }, { except: client });
    });

    this.onMessage('hit', (client, data) => {
        const { targetId, weaponType } = data;
        const target = this.state.players.get(targetId);
        const shooter = this.state.players.get(client.sessionId);
        
        if (!target || target.isDead || !shooter || shooter.isDead) return;

        let damage = 0;
        let role = shooter.role;
        
        if (role === 'human') {
            if (weaponType === 1) damage = 12; // Pistol
            else if (weaponType === 2) damage = 5; // Taser + Stun
        } else if (role === 'monster') {
            if (weaponType === 1) damage = 1; // Poison (DoT)
            else if (weaponType === 2) damage = 10; // Fireball
        }

        target.hp -= damage;
        
        // Handle Taser Stun
        if (role === 'human' && weaponType === 2) {
             this.broadcast("player_stunned", { sessionId: targetId, duration: 2000 });
        }
        
        // Handle Poison
        if (role === 'monster' && weaponType === 1) {
             let poisonTicks = 0;
             let interval = setInterval(() => {
                 if (!target || target.isDead || poisonTicks >= 5) {
                     clearInterval(interval);
                     return;
                 }
                 target.hp -= 1; // 1 damage per 2 seconds (handled by 2000ms interval)
                 poisonTicks++;
                 if (target.hp <= 0 && !target.isDead) {
                     target.hp = 0;
                     target.isDead = true;
                     this.broadcast("player_died", { sessionId: targetId });
                     clearInterval(interval);
                 }
             }, 2000);
        }

        if (target.hp <= 0 && !target.isDead) {
            target.hp = 0;
            target.isDead = true;
            this.broadcast("player_died", { sessionId: targetId });
        }
    });
  }

  checkAllReady() {
    // Only start if we have maxClients and everyone is ready and has selected a role
    if (this.clients.length !== this.maxClients) return;

    let allReady = true;
    this.state.players.forEach((player) => {
      if (!player.isReady || player.role === '') {
        allReady = false;
      }
    });

    if (allReady) {
      console.log(`[GameRoom] All players ready and selected roles. Starting game!`);
      this.state.started = true;
      this.broadcast('start_game', {});
    }
  }

  onJoin(client, options) {
    console.log(`[GameRoom] ${client.sessionId} joined (${this.clients.length}/${this.maxClients})`);

    const player = new Player();
    player.sessionId = client.sessionId;
    
    // Spawn at random locations spread out
    player.x = WORLD_MARGIN + Math.random() * (WORLD_WIDTH - WORLD_MARGIN * 2);
    player.y = WORLD_MARGIN + Math.random() * (WORLD_HEIGHT - WORLD_MARGIN * 2);
    player.anim = 'stand';
    player.flipX = false;
    player.role = '';
    player.isReady = false;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client, consented) {
    console.log(`[GameRoom] ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
    
    // Optional: Stop the game if a player leaves, or let them rejoin. 
    // In original code it resets started to false
    this.state.started = false;
  }

  onDispose() {
    console.log(`[GameRoom] Room ${this.roomId} disposed`);
  }
}
