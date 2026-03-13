import Phaser from 'phaser';
import { dbg, dbgUpdate } from './debug.js';

const POSITION_SEND_INTERVAL_MS = 50; // 20 Hz updates
const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 3200;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.client = data.client;
    this.room = data.room;
  }

  create() {
    // ─── Map & Camera ───────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Create the Tilemap
    const map = this.make.tilemap({ key: 'mp_map' });
    const tileset = map.addTilesetImage('mp_tileset', 'mp_tiles');

    // Livello base (sfondo/struttura base)
    this.backgroundLayer = map.createLayer('Livello tile 1', tileset, 0, 0);

    // ─── Networking State ───────────────────────────────────────────────────
    this.otherPlayers = new Map(); // Using Map like reference
    this.npcs = new Map(); // Using Map for ATMs
    this.positionSendTimer = 0;
    this.lastShootTime = 0;
    this.isDead = false;
    this.isStunned = false;
    this.lastFacingDir = { x: 0, y: 1 }; // Default facing down
    this.lastJoyBtn0 = false;
    this.lastJoyBtn1 = false;
    this.lastJoyBtn2 = false;
    this._lastLedHp = -1; // tracker per aggiornamento LED
    this.isTransforming = false;
    this.currentMode = 'human'; // aggiornato in onAdd con il ruolo scelto in lobby

    // ─── Projectile Groups ──────────────────────────────────────────────────
    this.localProjectiles = this.physics.add.group();
    this.remoteProjectiles = this.add.group();
    this.remotePlayersGroup = this.physics.add.group();
    this.npcGroup = this.physics.add.group();

    // ─── Input ──────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.keys = this.input.keyboard.addKeys('ENTER,BACKSPACE,R');

    // ─── UI ─────────────────────────────────────────────────────────────────
    const cx = -this.scale.width / 2;
    const cy = -this.scale.height / 2;
    
    // Contenitore UI ancorato al centro dello schermo, scalato inversamente allo zoom
    this.uiContainer = this.add.container(this.scale.width / 2, this.scale.height / 2).setScrollFactor(0).setDepth(100).setScale(1 / 1.3);

    const helpText = this.add.text(cx + 10, cy + 10, 'WASD: muovi  ENTER/BACKSPACE: spara', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 5, y: 4 }
    });

    const transformHelpText = this.add.text(cx + 10, cy + 38, '[R] Trasformazione', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#aaaaaa',
      backgroundColor: '#00000066',
      padding: { x: 4, y: 3 }
    });

    this.modeText = this.add.text((this.scale.width / 2) - 10, cy + 10, 'MODALITÀ: UMANO', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#88ddff',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 4 }
    }).setOrigin(1, 0);

    this.evolutionText = this.add.text(cx + 10, cy + 66, 'Evoluzione: 0%', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffbb00',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 3 }
    });

    this.evolutionBar = this.add.graphics();
    
    // Aggiungo tutto al container
    this.uiContainer.add([helpText, transformHelpText, this.modeText, this.evolutionText, this.evolutionBar]);

    this.createMapObjects();

    if (this.room) {
      this.setupStateSync();
    }

    // Serial event listeners
    this.game.events.on('serial:state', (msg) => {
      dbg(4, 'serial', 'SERIAL-IN', 'state axes:', msg.axes, 'btns:', msg.btns);
    });
    this.game.events.on('serial:config', (msg) => {
      dbg(3, 'serial', 'SERIAL-IN', 'config:', msg);
    });
    this.game.events.on('serial:connected', () => {
      dbg(3, 'serial', 'SERIAL-IN', 'controller connesso');
    });
    this.game.events.on('serial:error', (msg) => {
      dbg(1, 'serial', 'SERIAL-ERR', msg);
    });
  }

  // ─── Multiplayer Sync ─────────────────────────────────────────────────────
  setupStateSync() {
    const myId = this.room.sessionId;

    // Hit detection: Local Projectiles vs Remote Players
    this.physics.add.overlap(this.localProjectiles, this.remotePlayersGroup, (proj, remoteSprite) => {
      proj.destroy();
      dbg(3, 'multiplayer', 'GameScene', 'hit → targetId:', remoteSprite.sessionId, 'weaponType:', proj.weaponType);
      this.room.send('hit', { targetId: remoteSprite.sessionId, weaponType: proj.weaponType });
    });

    // Hit detection: Local Projectiles vs NPCs
    this.physics.add.overlap(this.localProjectiles, this.npcGroup, (proj, npcSprite) => {
      proj.destroy();
      dbg(3, 'multiplayer', 'GameScene', 'hit NPC → targetId:', npcSprite.npcId, 'weaponType:', proj.weaponType);
      this.room.send('hit', { targetId: npcSprite.npcId, weaponType: proj.weaponType });
    });

    // Listen to Shoot & Effects
    this.room.onMessage('player_shoot', (data) => {
      const shooter = this.room.state.players.get(data.sessionId);
      if (!shooter) return;
      this.spawnProjectile(data.sessionId, data.weaponType, shooter.role, data.x, data.y, data.vx, data.vy);
    });

    this.room.onMessage('player_stunned', (data) => {
      dbg(3, 'multiplayer', 'GameScene', 'player_stunned → sessionId:', data.sessionId, 'duration:', data.duration);
      if (data.sessionId === myId) {
        this.isStunned = true;
        this.localPlayerSprite.setTint(0x00ffff);
        this.time.delayedCall(data.duration, () => {
          this.isStunned = false;
          this.localPlayerSprite.clearTint();
        });
      } else {
        const remoteObj = this.otherPlayers.get(data.sessionId);
        if (remoteObj) {
          remoteObj.sprite.setTint(0x00ffff);
          this.time.delayedCall(data.duration, () => remoteObj.sprite.clearTint());
        }
      }
    });

    this.room.onMessage('player_transform', (data) => {
      dbg(3, 'multiplayer', 'GameScene', 'player_transform → sessionId:', data.sessionId, 'mode:', data.mode);
      this.onRemoteTransform(data.sessionId, data.mode);
    });

    this.room.onMessage('player_died', (data) => {
      dbg(3, 'multiplayer', 'GameScene', 'player_died → sessionId:', data.sessionId);
      if (data.sessionId === myId) {
        this.isDead = true;
        this.localPlayerSprite.setTint(0x555555);
        this.showGameOver();
      } else {
        const remoteObj = this.otherPlayers.get(data.sessionId);
        if (remoteObj) {
          remoteObj.sprite.setTint(0x555555);
        }
      }
    });

    // --- State Listeners: NPCs ---
    this.room.state.npcs.onAdd((npc, npcId) => {
      dbg(3, 'multiplayer', 'GameScene', 'NPC spawned → id:', npcId, 'role:', npc.role);
      const texture = npc.role === 'monster' ? 'monster' : 'player';
      const sprite = this.physics.add.sprite(npc.x, npc.y, texture).setDepth(8);
      sprite.npcId = npcId;
      this.npcGroup.add(sprite);

      const npcObj = {
        sprite: sprite,
        nameText: this.add.text(npc.x, npc.y - 45, `NPC ${npc.role}`, { fontSize: '12px', fill: npc.role === 'human' ? '#ffaaaa' : '#aaffaa', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5).setDepth(11),
        hpBar: this.add.graphics({ depth: 11 }),
        targetX: npc.x,
        targetY: npc.y,
        role: npc.role
      };
      if (texture === 'player' && npcObj.sprite.anims) npcObj.sprite.play('stand');
      this.npcs.set(npcId, npcObj);

      npc.onChange(() => {
        const upNpc = this.npcs.get(npcId);
        if (!upNpc) return;

        // LERP Targets
        const dx = Math.abs(npc.x - upNpc.sprite.x);
        const dy = Math.abs(npc.y - upNpc.sprite.y);
        if (dx > 150 || dy > 150) upNpc.sprite.body.reset(npc.x, npc.y);

        upNpc.targetX = npc.x;
        upNpc.targetY = npc.y;

        // Animations
        let animToPlay = npc.anim;
        if (npc.role === 'monster' && animToPlay && !animToPlay.startsWith('monster_')) {
          const map = { 'stand': 'monster_stand', 'walk': 'monster_downwalk', 'upwalk': 'monster_upwalk', 'rightwalk': 'monster_rightwalk', 'leftwalk': 'monster_leftwalk' };
          animToPlay = map[animToPlay] || 'monster_stand';
        }

        if (animToPlay && upNpc.sprite.anims && upNpc.sprite.anims.currentAnim?.key !== animToPlay) {
          upNpc.sprite.play(animToPlay, true);
        }

        if (npc.flipX !== undefined) upNpc.sprite.setFlipX(npc.flipX);

        if (npc.isDead) {
          upNpc.sprite.setTint(0x555555);
        }
      });
    });

    this.room.state.npcs.onRemove((npc, npcId) => {
      const upNpc = this.npcs.get(npcId);
      if (upNpc) {
        upNpc.sprite.destroy();
        upNpc.nameText.destroy();
        upNpc.hpBar.destroy();
        this.npcs.delete(npcId);
      }
    });

    // Listen for players joining or leaving
    this.room.state.players.onAdd((player, sessionId) => {

      if (sessionId === myId) {
        // Create Local Player
        const texture = player.role === 'monster' ? 'monster' : 'player';
        this.localPlayerSprite = this.physics.add.sprite(player.x, player.y, texture);
        this.localPlayerSprite.setCollideWorldBounds(true);
        if (texture === 'player' && this.localPlayerSprite.anims) this.localPlayerSprite.play('stand');
        this.localPlayerSprite.setDepth(10);

        dbg(3, 'multiplayer', 'GameScene', 'local player joined → team:', player.team, 'role:', player.role, 'hp:', player.hp);

        // Local HP & Name UI
        this.localNameText = this.add.text(player.x, player.y - 45, player.name || 'You', { fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(11);
        this.localHpBar = this.add.graphics({ depth: 11 });

        this.cameras.main.startFollow(this.localPlayerSprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.3); // Zoom ravvicinato (1.3) come richiesto

        // LED: vita piena all'inizio
        this._lastLedHp = player.hp;
        if (this.serialBridge?.connected) {
          this.serialBridge.bridge.send({ cmd: 'led', value: player.hp });
          dbg(3, 'serial', 'LED →', 'value:', player.hp);
        }

        // Modalità iniziale = ruolo scelto in lobby
        this.currentMode = player.role || 'human';
        this.updateModeVisibility();
        this.updateModeText();

        // Overlap collezionabili (solo dopo che lo sprite locale esiste)
        this.physics.add.overlap(
          this.localPlayerSprite, this.humanObjects,
          (p, obj) => this.collectObject(obj),
          () => this.currentMode === 'human',
          this
        );
        this.physics.add.overlap(
          this.localPlayerSprite, this.monsterObjects,
          (p, obj) => this.collectObject(obj),
          () => this.currentMode === 'monster',
          this
        );
        this.physics.add.overlap(
          this.localPlayerSprite, this.bothObjects,
          (p, obj) => this.collectObject(obj),
          null,
          this
        );

      } else {
        // Create Remote Player
        dbg(3, 'multiplayer', 'GameScene', 'remote player joined → sessionId:', sessionId, 'role:', player.role);
        const texture = player.role === 'monster' ? 'monster' : 'player';
        const sprite = this.physics.add.sprite(player.x, player.y, texture).setDepth(9);
        sprite.sessionId = sessionId; // Attach ID for collision parsing
        this.remotePlayersGroup.add(sprite);

        const remoteObj = {
          sprite: sprite,
          nameText: this.add.text(player.x, player.y - 45, player.name || 'Enemy', { fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(11),
          hpBar: this.add.graphics({ depth: 11 }),
          targetX: player.x,
          targetY: player.y,
          sessionId: sessionId
        }
        if (texture === 'player' && remoteObj.sprite.anims) remoteObj.sprite.play('stand');
        this.otherPlayers.set(sessionId, remoteObj);
      }
      player.onChange(() => {
        // If it's US, we ignore server position updates! We are authoritative locally.
        if (sessionId === myId) return;

        // If it's a REMOTE player, update their target for LERP
        const remoteObj = this.otherPlayers.get(sessionId);
        if (remoteObj) {
          // Teleport istantaneo per salti grandi (evita body desync)
          const dx = Math.abs(player.x - remoteObj.sprite.x);
          const dy = Math.abs(player.y - remoteObj.sprite.y);
          if (dx > 150 || dy > 150) {
            remoteObj.sprite.body.reset(player.x, player.y);
          }

          remoteObj.targetX = player.x;
          remoteObj.targetY = player.y;

          // Determine if remote player is human or monster based on player.role
          let animToPlay = player.anim;
          if (player.role === 'monster' && animToPlay && !animToPlay.startsWith('monster_')) {
            const map = { 'stand': 'monster_stand', 'walk': 'monster_downwalk', 'upwalk': 'monster_upwalk', 'rightwalk': 'monster_rightwalk', 'leftwalk': 'monster_leftwalk' };
            animToPlay = map[animToPlay] || 'monster_stand';
          }

          if (animToPlay && remoteObj.sprite.anims && remoteObj.sprite.anims.currentAnim?.key !== animToPlay) {
            remoteObj.sprite.play(animToPlay, true);
          }

          if (player.flipX !== undefined) {
            remoteObj.sprite.setFlipX(player.flipX);
          }
        }
      });
    });

    this.room.state.players.onRemove((player, sessionId) => {
      dbg(3, 'multiplayer', 'GameScene', 'player removed → sessionId:', sessionId);
      if (this.otherPlayers.has(sessionId)) {
        const remoteObj = this.otherPlayers.get(sessionId);
        remoteObj.sprite.destroy();
        remoteObj.nameText.destroy();
        remoteObj.hpBar.destroy();
        this.otherPlayers.delete(sessionId);
      }
    });
  }

  // ─── HP Bar & Evolution Bar Graphic ───────────────────────────────────────────────────────
  drawHpBar(graphics, x, y, hp) {
    graphics.clear();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(x - 20, y - 5, 40, 6);

    const pct = Math.max(0, hp / 100);
    graphics.fillStyle(pct > 0.5 ? 0x00ff00 : (pct > 0.2 ? 0xffff00 : 0xff0000), 1);
    graphics.fillRect(x - 19, y - 4, 38 * pct, 4);
  }

  drawEvolutionBar(graphics, hpBarY, evolutionAmt) {
    graphics.clear();
    const pct = Math.max(0, Math.min(100, evolutionAmt) / 100);
    this.evolutionText.setText(`Evoluzione: ${Math.floor(pct * 100)}%`);

    const cx = -this.scale.width / 2;
    const cy = -this.scale.height / 2;

    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(cx + 10, cy + 90, 200, 12);

    graphics.fillStyle(0xffaa00, 1);
    graphics.fillRect(cx + 12, cy + 92, 196 * pct, 8);
  }

  // ─── Weapons & Shoot ──────────────────────────────────────────────────────
  shootWeapon(weaponType) {
    if (this.isDead || this.isStunned) return;
    const now = this.time.now;
    if (now - this.lastShootTime < 400) return; // 0.4 sec cooldown
    this.lastShootTime = now;

    // Shooting based on the direction the character is facing
    const speed = 600;
    const vx = this.lastFacingDir.x * speed;
    const vy = this.lastFacingDir.y * speed;

    const myPlayer = this.room.state.players.get(this.room.sessionId);

    dbg(3, 'multiplayer', 'GameScene', 'shoot → weaponType:', weaponType, 'vx:', Math.round(vx), 'vy:', Math.round(vy));
    this.spawnProjectile(this.room.sessionId, weaponType, myPlayer.role, this.localPlayerSprite.x, this.localPlayerSprite.y, vx, vy);
    this.room.send('shoot', { weaponType, x: this.localPlayerSprite.x, y: this.localPlayerSprite.y, vx, vy });
  }

  spawnProjectile(shooterId, weaponType, role, x, y, vx, vy) {
    let color = 0xffffff;
    if (role === 'human') {
      color = weaponType === 1 ? 0xffff00 : 0x00aaff; // Pistol (Yellow) / Taser (Blue)
    } else {
      color = weaponType === 1 ? 0x00ff00 : 0xff4400; // Poison (Green) / Fireball (Orange)
    }

    const proj = this.physics.add.sprite(x, y, 'bullet').setDepth(8);
    proj.setTint(color);

    if (shooterId === this.room.sessionId) {
      proj.weaponType = weaponType;
      this.localProjectiles.add(proj);
    } else {
      this.remoteProjectiles.add(proj);
    }

    // Fix: Set velocity AFTER adding to groups to avoid default resets
    proj.setVelocity(vx, vy);

    // Auto destroy after 1.5 seconds to prevent off-screen accumulation
    this.time.delayedCall(1500, () => {
      if (proj && proj.active) proj.destroy();
    });
  }

  showGameOver() {
    // Aggiungo il Game Over Text e Background alla UI camera container
    const warnBg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0.5, 0.5);
    const textOver = this.add.text(0, 0, 'GAME OVER', { fontSize: '64px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5);
    this.uiContainer.add([warnBg, textOver]);
  }

  // ─── Update Loop ──────────────────────────────────────────────────────────
  update(time, delta) {
    if (!this.localPlayerSprite || !this.room) return;

    // 1. Process Input & Shooting
    if (!this.isDead && !this.isStunned) {
      // Trasformazione (R key) — sempre disponibile fuori dal blocco isTransforming
      if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.triggerTransform();

      if (!this.isTransforming) {
        if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) this.shootWeapon(1);
        else if (Phaser.Input.Keyboard.JustDown(this.keys.BACKSPACE)) this.shootWeapon(2);
      }

      // Joystick Buttons
      const btns = this.registry.get('serial.btns');
      if (btns) {
        const btn0 = btns[0] === 1;
        const btn1 = btns[1] === 1;
        const btn2 = btns[2] === 1; // Trasformazione

        if (btn2 && !this.lastJoyBtn2) this.triggerTransform();
        if (!this.isTransforming) {
          if (btn0 && !this.lastJoyBtn0) this.shootWeapon(1);
          if (btn1 && !this.lastJoyBtn1) this.shootWeapon(2);
        }

        this.lastJoyBtn0 = btn0;
        this.lastJoyBtn1 = btn1;
        this.lastJoyBtn2 = btn2;
      }
    }

    // 2. Process Local Movement Physics
    const speed = 250;
    let vx = 0;
    let vy = 0;

    if (!this.isDead && !this.isStunned && !this.isTransforming) {
      // Keyboard fallback
      if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
      else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;

      if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
      else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

      // Joystick Analog Override
      if (this.registry.get('serial.connected')) {
        const axes = this.registry.get('serial.axes');
        if (axes) {
          const JOY_THRESHOLD = 0.3;
          if (Math.abs(axes.x) > JOY_THRESHOLD) vx = axes.x * speed;
          // Invert Y axis because Arduino analog sticks often have inverted Y values
          if (Math.abs(axes.y) > JOY_THRESHOLD) vy = -axes.y * speed;
          dbgUpdate(this, 'joy_axes', 'serial', 'GameScene', 'axes x:', axes.x?.toFixed(2), 'y:', axes.y?.toFixed(2));
        }
      }
    }

    // Normalize diagonal velocity natively
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    // Save facing direction before applying it, to aim projectiles correctly
    if (vx !== 0 || vy !== 0) {
      this.lastFacingDir = { x: vx, y: vy };
      // Normalize the facing direction purely for aiming math
      const mag = Math.sqrt(this.lastFacingDir.x * this.lastFacingDir.x + this.lastFacingDir.y * this.lastFacingDir.y);
      this.lastFacingDir.x /= mag;
      this.lastFacingDir.y /= mag;
    }

    // Apply local phaser velocity!
    this.localPlayerSprite.setVelocity(vx, vy);

    // 2. Process Local Animation
    let baseAnim = 'stand';
    let flipX = this.localPlayerSprite.flipX; // preserve direction

    if (vx !== 0 || vy !== 0) {
      if (vy < 0) baseAnim = 'upwalk';
      else if (vy > 0) baseAnim = 'walk';
      else if (vx > 0) {
        baseAnim = 'rightwalk';
        flipX = false;
      }
      else if (vx < 0) {
        baseAnim = 'leftwalk';
        flipX = false;
      }
    }

    let anim = baseAnim;
    if (this.currentMode === 'monster') {
      const monsterMap = {
        'stand': 'monster_stand',
        'walk': 'monster_downwalk',
        'upwalk': 'monster_upwalk',
        'rightwalk': 'monster_rightwalk',
        'leftwalk': 'monster_leftwalk'
      };
      anim = monsterMap[baseAnim] || 'monster_stand';
    }

    if (this.localPlayerSprite.anims && this.localPlayerSprite.anims.currentAnim?.key !== anim) {
      if (!this.isDead) this.localPlayerSprite.play(anim, true);
    }

    this.localPlayerSprite.setFlipX(flipX);

    // Sync Local UI
    const myPlayerState = this.room.state.players.get(this.room.sessionId);
    if (myPlayerState) {
      this.localNameText.setPosition(this.localPlayerSprite.x, this.localPlayerSprite.y - 45);
      this.localNameText.setText(myPlayerState.name || 'You');
      this.drawHpBar(this.localHpBar, this.localPlayerSprite.x, this.localPlayerSprite.y - 35, myPlayerState.hp);
      this.drawEvolutionBar(this.evolutionBar, this.localPlayerSprite.y - 35, myPlayerState.evolution);

      // LED: invia aggiornamento al controller quando l'HP cambia
      if (myPlayerState.hp !== this._lastLedHp) {
        dbg(3, 'multiplayer', 'GameScene', 'HP change →', this._lastLedHp, '→', myPlayerState.hp, '| LED:', myPlayerState.hp);
        this._lastLedHp = myPlayerState.hp;
        if (this.serialBridge?.connected) {
          this.serialBridge.bridge.send({ cmd: 'led', value: myPlayerState.hp });
          dbg(3, 'serial', 'LED →', 'value:', myPlayerState.hp);
        }
      }

      if (myPlayerState.isDead && !this.isDead) {
        // Failsafe catch for DoT deaths
        this.isDead = true;
        this.localPlayerSprite.setTint(0x555555);
        this.showGameOver();
      }
    }

    // 4. Tick Remote Players (LERP & UI)
    // lerpFactor 0.5: su localhost (latenza ~0ms) porta lo sprite a >87% del target in 3 frame (50ms)
    const lerpFactor = 0.5;
    this.otherPlayers.forEach((remoteObj, sessId) => {
      const nx = remoteObj.sprite.x + (remoteObj.targetX - remoteObj.sprite.x) * lerpFactor;
      const ny = remoteObj.sprite.y + (remoteObj.targetY - remoteObj.sprite.y) * lerpFactor;
      remoteObj.sprite.body.reset(nx, ny);

      const pState = this.room.state.players.get(sessId);
      if (pState) {
        remoteObj.nameText.setPosition(remoteObj.sprite.x, remoteObj.sprite.y - 45);
        remoteObj.nameText.setText(pState.name || 'Enemy');
        this.drawHpBar(remoteObj.hpBar, remoteObj.sprite.x, remoteObj.sprite.y - 35, pState.hp);
      }
    });

    // Tick NPCs
    this.npcs.forEach((npcObj, npcId) => {
      const nx = npcObj.sprite.x + (npcObj.targetX - npcObj.sprite.x) * lerpFactor;
      const ny = npcObj.sprite.y + (npcObj.targetY - npcObj.sprite.y) * lerpFactor;
      npcObj.sprite.body.reset(nx, ny);

      const nState = this.room.state.npcs.get(npcId);
      if (nState) {
        npcObj.nameText.setPosition(npcObj.sprite.x, npcObj.sprite.y - 45);
        this.drawHpBar(npcObj.hpBar, npcObj.sprite.x, npcObj.sprite.y - 35, nState.hp);
      }
    });

    // 5. Send position to server at 20 Hz
    this.positionSendTimer += delta;
    if (this.positionSendTimer >= POSITION_SEND_INTERVAL_MS) {
      this.positionSendTimer = 0;

      // Only send if moving, OR if we just stopped moving to force a final stop update
      if (vx !== 0 || vy !== 0 || this.lastSentAnim !== anim) {
        dbgUpdate(this, 'pos_send', 'multiplayer', 'GameScene', 'position send → x:', Math.round(this.localPlayerSprite.x), 'y:', Math.round(this.localPlayerSprite.y), 'anim:', anim);
        this.room.send('MSG_PLAYER_POSITION', {
          x: this.localPlayerSprite.x,
          y: this.localPlayerSprite.y,
          anim: anim,
          flipX: flipX
        });
        this.lastSentAnim = anim;
      }
    }
  }

  // ─── Trasformazione ───────────────────────────────────────────────────────

  triggerTransform() {
    if (this.isDead || !this.localPlayerSprite) return;

    if (this.isTransforming) {
      console.log("Già in trasformazione!");
      return;
    }

    // Check Evolution limits for BOTH modes
    const myPlayerState = this.room.state.players.get(this.room.sessionId);

    // Tolleranza per possibili arrotondamenti
    if (myPlayerState.evolution < 99) {
      dbg(3, 'multiplayer', 'GameScene', 'Trasformazione negata, evoluzione insufficiente:', myPlayerState.evolution);
      // Feedback visivo nel UI container
      const warnText = this.add.text(0, -this.scale.height / 2 + 80, 'Evoluzione insufficiente per trasformarsi!', {
        fontFamily: 'monospace', fontSize: '16px', color: '#ff0000', backgroundColor: '#000000aa', padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      this.uiContainer.add(warnText);
      this.time.delayedCall(2000, () => warnText.destroy());
      return;
    }

    this.isTransforming = true;

    const px = this.localPlayerSprite.x;
    const py = this.localPlayerSprite.y;

    // Ferma il giocatore e nascondilo durante l'animazione
    this.localPlayerSprite.setVelocity(0, 0);
    this.localPlayerSprite.setVisible(false);

    try {
      // Sprite dell'animazione (64x64 * 3 = 192x192)
      const animSprite = this.add.sprite(px, py, 'evoluzione').setDepth(20).setScale(3);
      animSprite.play('evoluzione_anim');

      animSprite.on('animationcomplete', () => {
        animSprite.destroy();
        this.finishTransform();
      });
    } catch (e) {
      console.error("Errore durante l'animazione di trasformazione:", e);
      this.finishTransform(); // Forza il completamento se l'animazione fallisce
    }
  }

  finishTransform() {
    // Cambia modalità localmente
    this.currentMode = this.currentMode === 'human' ? 'monster' : 'human';

    // Aggiorna texture giocatore
    const newTexture = this.currentMode === 'monster' ? 'monster' : 'player';
    this.localPlayerSprite.setTexture(newTexture);
    this.localPlayerSprite.play(this.currentMode === 'monster' ? 'monster_stand' : 'stand');

    // Tinta mappa in base alla modalità
    try {
      if (this.currentMode === 'monster') {
        this.backgroundLayer.setTint(0x4a4e69); // viola scuro
      } else {
        if (this.backgroundLayer.clearTint) {
          this.backgroundLayer.clearTint();
        } else {
          this.backgroundLayer.setTint(0xffffff);
        }
      }
    } catch (e) { console.error("Errore nel settare il tint della mappa", e); }

    this.updateModeVisibility();
    this.updateModeText();

    this.localPlayerSprite.setVisible(true);
    this.isTransforming = false;

    dbg(3, 'multiplayer', 'GameScene', 'trasformazione completata localmente → modalità:', this.currentMode);

    // Notifica il server
    if (this.room) {
      this.room.send('transform', { mode: this.currentMode });
    }
  }



  // Gestisce la trasformazione di un giocatore remoto
  onRemoteTransform(sessionId, mode) {
    const remoteObj = this.otherPlayers.get(sessionId);
    if (!remoteObj) return;

    const px = remoteObj.sprite.x;
    const py = remoteObj.sprite.y;

    remoteObj.sprite.setVisible(false);

    const animSprite = this.add.sprite(px, py, 'evoluzione').setDepth(20).setScale(3);
    animSprite.play('evoluzione_anim');

    animSprite.on('animationcomplete', () => {
      animSprite.destroy();
      const newTexture = mode === 'monster' ? 'monster' : 'player';
      remoteObj.sprite.setTexture(newTexture);
      remoteObj.sprite.setVisible(true);
      remoteObj.sprite.play(mode === 'monster' ? 'monster_stand' : 'stand');
    });
  }

  // ─── Oggetti Mappa / Collezionabili ──────────────────────────────────────

  // Genera i gruppi di collezionabili sparsi sulla mappa.
  // Visibilità:
  //   humanObjects   → solo in modalità UMANO (es. medikit, munizioni)
  //   monsterObjects → solo in modalità MOSTRO (es. essenza oscura, cristalli)
  //   bothObjects    → visibili in entrambe le modalità (es. pozioni neutre)
  createMapObjects() {
    this.humanObjects = this.physics.add.staticGroup();
    this.monsterObjects = this.physics.add.staticGroup();
    this.bothObjects = this.physics.add.staticGroup();

    const margin = 250;
    const W = WORLD_WIDTH;
    const H = WORLD_HEIGHT;

    const scatter = (group, key, count) => {
      for (let i = 0; i < count; i++) {
        const x = margin + Math.random() * (W - margin * 2);
        const y = margin + Math.random() * (H - margin * 2);
        group.create(x, y, key).setDepth(5).setScale(1.2);
      }
    };

    scatter(this.humanObjects, 'collectible_human', 18); // solo umano
    scatter(this.monsterObjects, 'collectible_monster', 18); // solo mostro
    scatter(this.bothObjects, 'collectible_both', 12); // entrambi

    // Visibilità iniziale gestita da updateModeVisibility() chiamato in onAdd
  }

  // Aggiorna la visibilità e i corpi fisici in base alla modalità corrente
  updateModeVisibility() {
    const isMonster = this.currentMode === 'monster';

    this.humanObjects?.children.each(obj => {
      obj.setVisible(!isMonster);
      if (obj.body) obj.body.enable = !isMonster;
    });

    this.monsterObjects?.children.each(obj => {
      obj.setVisible(isMonster);
      if (obj.body) obj.body.enable = isMonster;
    });

    // bothObjects: sempre visibili, body sempre attivo
  }

  // Raccoglie un oggetto: disabilita il corpo fisico e lo dissolve via tween
  collectObject(obj) {
    if (!obj || !obj.active) return;
    obj.body.enable = false; // previene trigger multipli

    // INVIA MESSAGGIO AL SERVER (es. 10 punti evo)
    if (this.room) {
      this.room.send('collect_item', { points: 10 });
    }

    this.tweens.add({
      targets: obj,
      alpha: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 350,
      ease: 'Power2Out',
      onComplete: () => { if (obj.active) obj.destroy(); }
    });
  }

  // ─── HUD Modalità ─────────────────────────────────────────────────────────

  updateModeText() {
    if (!this.modeText) return;
    if (this.currentMode === 'monster') {
      this.modeText.setText('MODALITÀ: MOSTRO').setColor('#ff8866');
    } else {
      this.modeText.setText('MODALITÀ: UMANO').setColor('#88ddff');
    }
  }
}
