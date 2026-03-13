import pkg from 'colyseus';
const { Room, matchMaker } = pkg;
import { GameState } from '../schema/GameState.js';
import { Player } from '../schema/Player.js';
import { Npc } from '../schema/Npc.js';

// Arena bounds
const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 3200;
const WORLD_MARGIN = 50;

const HUMAN_NAMES = ['Alex', 'Sarah', 'John', 'Emma', 'Mike', 'Lisa'];
const MONSTER_NAMES = ['Gothmog', 'Zorblax', 'Mordrok', 'Xythar', 'Gruumsh', 'Vorg'];

export class GameRoom extends Room {
    onCreate(options) {
        this.setState(new GameState());
        this.maxClients = 4; // Keep at 2 players as requested

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

            // Reset the evolution when they transform
            if (player.evolution >= 100) {
                player.evolution = 0;
                player.role = player.role === 'human' ? 'monster' : 'human';
            } else {
                return; // Ignore invalid transformation requests
            }

            // Relay la trasformazione a tutti gli altri client
            this.broadcast('player_transform', {
                sessionId: client.sessionId,
                mode: data.mode
            }, { except: client });
        });

        this.onMessage('hit', (client, data) => {
            const { targetId, weaponType } = data;
            let target = this.state.players.get(targetId);
            let isNpc = false;

            if (!target) {
                target = this.state.npcs.get(targetId);
                isNpc = true;
            }

            const shooter = this.state.players.get(client.sessionId);

            if (!target || target.isDead || !shooter || shooter.isDead) return;

            let damage = 0;
            let role = shooter.role;

            if (role === 'human') {
                if (weaponType === 1) damage = 12; // Pistol
                else if (weaponType === 2) damage = 2; // Taser + Stun
            } else if (role === 'monster') {
                if (weaponType === 1) damage = 1; // Poison (DoT)
                else if (weaponType === 2) damage = 10; // Fireball
            }

            target.hp -= damage;

            // Give some large evolution on hit
            if (shooter.evolution < 100) {
                // 2.5x damage as evolution points to fill up much faster
                shooter.evolution = Math.min(100, shooter.evolution + (damage * 2.5));
            }

            // Handle Taser Stun
            if (role === 'human' && weaponType === 2 && !isNpc) {
                this.broadcast("player_stunned", { sessionId: targetId, duration: 1000 });
            }

            // Handle Poison
            if (role === 'monster' && weaponType === 1) {
                let poisonTicks = 0;
                let interval = setInterval(() => {
                    if (!target || target.isDead || poisonTicks >= 5) {
                        clearInterval(interval);
                        return;
                    }
                    target.hp -= 1; // 1 damage per 2 seconds
                    poisonTicks++;
                    if (target.hp <= 0 && !target.isDead) {
                        target.hp = 0;
                        target.isDead = true;
                        if (!isNpc) this.broadcast("player_died", { sessionId: targetId });
                        clearInterval(interval);
                        if (shooter.evolution < 100) {
                            shooter.evolution = Math.min(100, shooter.evolution + 50);
                        }
                    }
                }, 2000);
            }

            if (target.hp <= 0 && !target.isDead) {
                target.hp = 0;
                target.isDead = true;
                if (!isNpc) this.broadcast("player_died", { sessionId: targetId });

                // Give large evolution bonus on kill
                if (shooter.evolution < 100) {
                    shooter.evolution = Math.min(100, shooter.evolution + 50);
                }
            }
        });

        this.onMessage('collect_item', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (!player || !this.state.started || player.isDead) return;

            // Increase evolution points and clamp to 100
            player.evolution = Math.min(100, player.evolution + (data.points || 10));
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
            this.spawnInitialNpcs();
            this.startGameLoop();
            this.broadcast('start_game', {});
        }
    }

    spawnInitialNpcs() {
        // Spawn 3 AI humans and 3 AI monsters
        const spawnNpcRole = (role, count) => {
            for (let i = 0; i < count; i++) {
                let npc = new Npc();
                npc.id = `npc_${role}_${Math.random().toString(36).substr(2, 9)}`;
                npc.x = WORLD_MARGIN + Math.random() * (WORLD_WIDTH - WORLD_MARGIN * 2);
                npc.y = WORLD_MARGIN + Math.random() * (WORLD_HEIGHT - WORLD_MARGIN * 2);
                npc.role = role;
                npc.hp = 100;
                this.state.npcs.set(npc.id, npc);
            }
        };

        spawnNpcRole('human', 3);
        spawnNpcRole('monster', 3);
    }

    startGameLoop() {
        this.npcSpawnTarget = 3;

        // Server-side AI Tick (10 times a second)
        this.setSimulationInterval((deltaTime) => {
            this.updateNpcs(deltaTime);
        }, 100);

        // Auto-respawn NPCs every 10 seconds if needed
        this.respawnInterval = setInterval(() => {
            // Count active
            let humCount = 0;
            let monCount = 0;
            this.state.npcs.forEach(npc => {
                if (npc.isDead) return;
                if (npc.role === 'human') humCount++;
                if (npc.role === 'monster') monCount++;
            });

            while (humCount < this.npcSpawnTarget) {
                let npc = new Npc();
                npc.id = `npc_human_${Math.random().toString(36).substr(2, 9)}`;
                npc.x = WORLD_MARGIN + Math.random() * (WORLD_WIDTH - WORLD_MARGIN * 2);
                npc.y = WORLD_MARGIN + Math.random() * (WORLD_HEIGHT - WORLD_MARGIN * 2);
                npc.role = 'human';
                this.state.npcs.set(npc.id, npc);
                humCount++;
            }
            while (monCount < this.npcSpawnTarget) {
                let npc = new Npc();
                npc.id = `npc_monster_${Math.random().toString(36).substr(2, 9)}`;
                npc.x = WORLD_MARGIN + Math.random() * (WORLD_WIDTH - WORLD_MARGIN * 2);
                npc.y = WORLD_MARGIN + Math.random() * (WORLD_HEIGHT - WORLD_MARGIN * 2);
                npc.role = 'monster';
                this.state.npcs.set(npc.id, npc);
                monCount++;
            }

            // Aumenta la scalata del respawn
            this.npcSpawnTarget += 1;
        }, 15000); // 15 seconds spawn/scaling loop
    }

    updateNpcs(deltaTime) {
        if (!this.state.started) return;
        const speed = 100; // units per second
        const moveDist = speed * (deltaTime / 1000);

        this.state.npcs.forEach(npc => {
            if (npc.isDead) return;

            // Trova il bersaglio più vicino di ruolo OPPOSTO
            let closestTarget = null;
            let minDist = Infinity; // Rimuoviamo il limite di aggro
            let targetIsPlayer = false;

            // Controlla i giocatori
            this.state.players.forEach(p => {
                if (p.isDead || p.role === npc.role || !p.role) return;
                let d = Math.hypot(p.x - npc.x, p.y - npc.y);
                if (d < minDist) {
                    minDist = d;
                    closestTarget = p;
                    targetIsPlayer = true;
                }
            });

            // Controlla altri NPC
            this.state.npcs.forEach(n => {
                if (n.isDead || n.role === npc.role) return;
                let d = Math.hypot(n.x - npc.x, n.y - npc.y);
                if (d < minDist) {
                    minDist = d;
                    closestTarget = n;
                    targetIsPlayer = false;
                }
            });

            if (closestTarget) {
                // Insegui
                let dx = closestTarget.x - npc.x;
                let dy = closestTarget.y - npc.y;
                let mag = Math.hypot(dx, dy);
                if (mag > 50) { // distanza minima
                    npc.x += (dx / mag) * moveDist;
                    npc.y += (dy / mag) * moveDist;

                    npc.anim = Math.abs(dx) > Math.abs(dy) ? 'rightwalk' : (dy > 0 ? 'walk' : 'upwalk');
                    if (dx < 0 && Math.abs(dx) > Math.abs(dy)) npc.anim = 'leftwalk';
                    npc.flipX = false;
                } else {
                    npc.anim = 'stand';
                    // Touch damage
                    const now = Date.now();
                    if (!npc.lastAttackTime || now - npc.lastAttackTime > 1500) { // Cooldown attacco
                        npc.lastAttackTime = now;
                        closestTarget.hp -= 5; // Danno

                        if (closestTarget.hp <= 0 && !closestTarget.isDead) {
                            closestTarget.hp = 0;
                            closestTarget.isDead = true;
                            if (targetIsPlayer) {
                                this.broadcast("player_died", { sessionId: closestTarget.sessionId });
                            }
                        }
                    }
                }
            } else {
                // Movimento casuale pigro se non c'è bersaglio
                if (Math.random() < 0.05) {
                    npc.targetX = npc.x + (Math.random() * 200 - 100);
                    npc.targetY = npc.y + (Math.random() * 200 - 100);
                }
                if (npc.targetX !== undefined) {
                    let dx = npc.targetX - npc.x;
                    let dy = npc.targetY - npc.y;
                    let mag = Math.hypot(dx, dy);
                    if (mag > 10) {
                        npc.x += (dx / mag) * (moveDist * 0.5); // cammina più lento
                        npc.y += (dy / mag) * (moveDist * 0.5);
                        npc.anim = 'walk';
                    } else {
                        npc.anim = 'stand';
                    }
                } else {
                    npc.anim = 'stand';
                }
            }

            npc.x = Math.max(WORLD_MARGIN, Math.min(WORLD_WIDTH - WORLD_MARGIN, npc.x));
            npc.y = Math.max(WORLD_MARGIN, Math.min(WORLD_HEIGHT - WORLD_MARGIN, npc.y));
        });
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
        if (this.respawnInterval) clearInterval(this.respawnInterval);
    }
}
