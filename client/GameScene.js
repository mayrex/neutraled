import Phaser from 'phaser';

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

    // Create a large tiled background for the plains map
    // Using the original map image as a full repeating TileSprite
    this.background = this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'plains_bg')
                              .setOrigin(0, 0);

    // ─── Networking State ───────────────────────────────────────────────────
    this.otherPlayers = new Map(); // Using Map like reference
    this.positionSendTimer = 0;
    this.lastShootTime = 0;
    this.isDead = false;
    this.isStunned = false;
    this.lastFacingDir = { x: 0, y: 1 }; // Default facing down
    this.lastJoyBtn0 = false;
    this.lastJoyBtn1 = false;

    // ─── Projectile Groups ──────────────────────────────────────────────────
    this.localProjectiles = this.physics.add.group();
    this.remoteProjectiles = this.add.group();
    this.remotePlayersGroup = this.physics.add.group();

    // ─── Input ──────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.keys = this.input.keyboard.addKeys('ENTER,BACKSPACE');

    // ─── UI ─────────────────────────────────────────────────────────────────
    this.add.text(10, 10, 'Use Arrow Keys or WASD to move', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0);

    if (this.room) {
        this.setupStateSync();
    }
  }

  // ─── Multiplayer Sync ─────────────────────────────────────────────────────
  setupStateSync() {
    const myId = this.room.sessionId;

    // Hit detection: Local Projectiles vs Remote Players
    this.physics.add.overlap(this.localProjectiles, this.remotePlayersGroup, (proj, remoteSprite) => {
        proj.destroy();
        this.room.send('hit', { targetId: remoteSprite.sessionId, weaponType: proj.weaponType });
    });

    // Listen to Shoot & Effects
    this.room.onMessage('player_shoot', (data) => {
        const shooter = this.room.state.players.get(data.sessionId);
        if (!shooter) return;
        this.spawnProjectile(data.sessionId, data.weaponType, shooter.role, data.x, data.y, data.vx, data.vy);
    });

    this.room.onMessage('player_stunned', (data) => {
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

    this.room.onMessage('player_died', (data) => {
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

    // Listen for players joining or leaving
    this.room.state.players.onAdd((player, sessionId) => {
      
      if (sessionId === myId) {
        // Create Local Player
        const texture = player.role === 'monster' ? 'monster' : 'player';
        this.localPlayerSprite = this.physics.add.sprite(player.x, player.y, texture);
        this.localPlayerSprite.setCollideWorldBounds(true);
        if (texture === 'player') this.localPlayerSprite.play('stand');
        this.localPlayerSprite.setDepth(10);
        
        // Local HP & Name UI
        this.localNameText = this.add.text(player.x, player.y - 45, player.name || 'You', { fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(11);
        this.localHpBar = this.add.graphics({ depth: 11 });

        this.cameras.main.startFollow(this.localPlayerSprite, true, 0.1, 0.1);

      } else {
        // Create Remote Player
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
        if (texture === 'player') remoteObj.sprite.play('stand');
        this.otherPlayers.set(sessionId, remoteObj);
      }
      player.onChange(() => {
        // If it's US, we ignore server position updates! We are authoritative locally.
        if (sessionId === myId) return;

        // If it's a REMOTE player, update their target for LERP
        const remoteObj = this.otherPlayers.get(sessionId);
        if (remoteObj) {
            // Fix large teleports natively like topdown-shooter
            const dx = Math.abs(player.x - remoteObj.sprite.x);
            const dy = Math.abs(player.y - remoteObj.sprite.y);
            if (dx > 200 || dy > 200) {
                remoteObj.sprite.x = player.x;
                remoteObj.sprite.y = player.y;
            }

            remoteObj.targetX = player.x;
            remoteObj.targetY = player.y;

            if (player.anim && remoteObj.sprite.texture.key === 'player' && remoteObj.sprite.anims.currentAnim?.key !== player.anim) {
                remoteObj.sprite.play(player.anim, true);
            }
            if (player.flipX !== undefined) {
                remoteObj.sprite.setFlipX(player.flipX);
            }
        }
      });
    });

    this.room.state.players.onRemove((player, sessionId) => {
      if (this.otherPlayers.has(sessionId)) {
        const remoteObj = this.otherPlayers.get(sessionId);
        remoteObj.sprite.destroy();
        remoteObj.nameText.destroy();
        remoteObj.hpBar.destroy();
        this.otherPlayers.delete(sessionId);
      }
    });
  }

  // ─── HP Bar Graphic ───────────────────────────────────────────────────────
  drawHpBar(graphics, x, y, hp) {
      graphics.clear();
      graphics.fillStyle(0x000000, 1);
      graphics.fillRect(x - 20, y - 5, 40, 6);
      
      const pct = Math.max(0, hp / 100);
      graphics.fillStyle(pct > 0.5 ? 0x00ff00 : (pct > 0.2 ? 0xffff00 : 0xff0000), 1);
      graphics.fillRect(x - 19, y - 4, 38 * pct, 4);
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
      const { width, height } = this.scale;
      this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0,0).setScrollFactor(0).setDepth(100);
      this.add.text(width/2, height/2, 'GAME OVER', { fontSize: '64px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }

  // ─── Update Loop ──────────────────────────────────────────────────────────
  update(time, delta) {
    if (!this.localPlayerSprite || !this.room) return;

    // 1. Process Input & Shooting
    if (!this.isDead && !this.isStunned) {
        if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) this.shootWeapon(1);
        else if (Phaser.Input.Keyboard.JustDown(this.keys.BACKSPACE)) this.shootWeapon(2);
        
        // Joystick Buttons
        const btns = this.registry.get('serial.btns');
        if (btns) {
            const btn0 = btns[0] === 1; // Primary
            const btn1 = btns[1] === 1; // Secondary
            
            if (btn0 && !this.lastJoyBtn0) this.shootWeapon(1);
            if (btn1 && !this.lastJoyBtn1) this.shootWeapon(2);
            
            this.lastJoyBtn0 = btn0;
            this.lastJoyBtn1 = btn1;
        }
    }

    // 2. Process Local Movement Physics
    const speed = 250;
    let vx = 0;
    let vy = 0;

    if (!this.isDead && !this.isStunned) {
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
    let anim = 'stand';
    let flipX = this.localPlayerSprite.flipX; // preserve direction

    if (vx !== 0 || vy !== 0) {
      if (vy < 0) anim = 'upwalk';
      else if (vy > 0) anim = 'walk'; 
      else if (vx > 0) {
        anim = 'rightwalk';
        flipX = false;
      }
      else if (vx < 0) {
        anim = 'leftwalk';
        flipX = false;
      }
    }

    if (this.localPlayerSprite.anims && this.localPlayerSprite.texture.key === 'player' && this.localPlayerSprite.anims.currentAnim?.key !== anim) {
      if (!this.isDead) this.localPlayerSprite.play(anim, true);
    }
    this.localPlayerSprite.setFlipX(flipX);

    // Sync Local UI
    const myPlayerState = this.room.state.players.get(this.room.sessionId);
    if (myPlayerState) {
        this.localNameText.setPosition(this.localPlayerSprite.x, this.localPlayerSprite.y - 45);
        this.localNameText.setText(myPlayerState.name || 'You');
        this.drawHpBar(this.localHpBar, this.localPlayerSprite.x, this.localPlayerSprite.y - 35, myPlayerState.hp);
        
        if (myPlayerState.isDead && !this.isDead) {
            // Failsafe catch for DoT deaths
            this.isDead = true;
            this.localPlayerSprite.setTint(0x555555);
            this.showGameOver();
        }
    }

    // 4. Tick Remote Players (LERP & UI)
    const lerpFactor = 0.18;
    this.otherPlayers.forEach((remoteObj, sessId) => {
        remoteObj.sprite.x += (remoteObj.targetX - remoteObj.sprite.x) * lerpFactor;
        remoteObj.sprite.y += (remoteObj.targetY - remoteObj.sprite.y) * lerpFactor;

        const pState = this.room.state.players.get(sessId);
        if (pState) {
            remoteObj.nameText.setPosition(remoteObj.sprite.x, remoteObj.sprite.y - 45);
            remoteObj.nameText.setText(pState.name || 'Enemy');
            this.drawHpBar(remoteObj.hpBar, remoteObj.sprite.x, remoteObj.sprite.y - 35, pState.hp);
        }
    });

    // 5. Send position to server at 20 Hz
    this.positionSendTimer += delta;
    if (this.positionSendTimer >= POSITION_SEND_INTERVAL_MS) {
        this.positionSendTimer = 0;
        
        // Only send if moving, OR if we just stopped moving to force a final stop update
        if (vx !== 0 || vy !== 0 || this.lastSentAnim !== anim) {
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
}
