import Phaser from 'phaser';

export default class WaitingRoomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WaitingRoomScene' });
  }

  init(data) {
    this.client = data.client;
    this.room = data.room;
  }


  create() {
    this.bgMusic = this.sound.add('waiting_room_music', { loop: true, volume: 0.3 });
    this.bgMusic.play();

    const { width, height } = this.scale;

    // ── Background ─────────────────────────────────────────────────────
    // ── Background & Gradients ─────────────────────────────────────────
    // Neutral background
    this.bgNeutral = this.add.graphics();
    this.bgNeutral.lineStyle(1, 0x1a1a2e, 0.6);
    for (let x = 0; x < width; x += 40) this.bgNeutral.lineBetween(x, 0, x, height);
    for (let y = 0; y < height; y += 40) this.bgNeutral.lineBetween(0, y, width, y);

    // Blue glow (Human)
    this.bgHuman = this.add.graphics();
    this.bgHuman.fillGradientStyle(0x000033, 0x000033, 0x0033aa, 0x0033aa, 0, 0, 1, 1);
    this.bgHuman.fillRect(0, 0, width, height);
    this.bgHuman.setAlpha(0);

    // Red glow (Monster)
    this.bgMonster = this.add.graphics();
    this.bgMonster.fillGradientStyle(0x330000, 0x330000, 0xaa0000, 0xaa0000, 0, 0, 1, 1);
    this.bgMonster.fillRect(0, 0, width, height);
    this.bgMonster.setAlpha(0);

    // ── Pulsing circle ─────────────────────────────────────────────────
    this.ring = this.add.graphics();
    this.ringScale = 1;
    this.ringDir = 0.005;

    // ── Previews ───────────────────────────────────────────────────────
    // Shift the sprite up slightly to avoid overlapping buttons
    this.humanSprite = this.add.image(width / 2, height / 2 - 20, 'human_preview').setScale(2).setVisible(false);
    this.monsterSprite = this.add.image(width / 2, height / 2 - 20, 'monster_preview').setScale(2).setVisible(false);

    // Idle animation for sprites
    this.tweens.add({
      targets: [this.humanSprite, this.monsterSprite],
      y: '-=10',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ── UI Text ────────────────────────────────────────────────────────
    this.add
      .text(width / 2, height / 2 - 200, 'LOBBY', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#e8f4f8',
        stroke: '#00d4ff',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.sessionText = this.add
      .text(width / 2, height / 2 - 160, `Session: ${this.room.sessionId}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    // ── Player List UI ─────────────────────────────────────────────────
    this.playerListTexts = {}; // sessionId -> Phaser.GameObjects.Text

    // Move the player list up carefully to avoid overlapping the LOBBY text or the Sprite
    const listStartY = height / 2 - 120;
    this.playerListContainer = this.add.container(width / 2, listStartY);

    // ── Interactive Buttons (My Player) ────────────────────────────────
    const btnY = height / 2 + 80;

    // Role selection
    this.add.text(width / 2 - 150, btnY, 'Role:', { fontFamily: 'monospace', fontSize: '18px', color: '#fff' }).setOrigin(1, 0.5);

    this.btnHuman = this.createButton(width / 2 - 60, btnY, 'HUMAN', () => {
      if (!this.amIReady) this.room.send('set_role', { role: 'human' });
    });

    this.btnMonster = this.createButton(width / 2 + 60, btnY, 'MONSTER', () => {
      if (!this.amIReady) this.room.send('set_role', { role: 'monster' });
    });

    // Ready button
    this.btnReady = this.createButton(width / 2, btnY + 60, 'READY', () => {
      const myPlayer = this.room.state.players.get(this.room.sessionId);
      if (myPlayer && myPlayer.role !== '') {
        this.amIReady = !this.amIReady; // Toggle ready
        this.room.send('set_ready', { ready: this.amIReady });
        this.updateButtons();
      }
    });

    this.amIReady = false;

    // ── Room state listener ────────────────────────────────────────────
    this.room.state.players.onAdd((player, sessionId) => {
      const text = this.add.text(0, Object.keys(this.playerListTexts).length * 30, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: sessionId === this.room.sessionId ? '#00ffcc' : '#ffffff',
      }).setOrigin(0.5, 0);

      this.playerListTexts[sessionId] = text;
      this.playerListContainer.add(text);

      this.updatePlayerText(player, sessionId);

      player.onChange(() => {
        this.updatePlayerText(player, sessionId);
        if (sessionId === this.room.sessionId) {
          this.amIReady = player.isReady;
          this.updateButtons(player);
        }
      });

      if (sessionId === this.room.sessionId) {
        this.updateButtons(player);
      }
    });

    this.room.state.players.onRemove((player, sessionId) => {
      if (this.playerListTexts[sessionId]) {
        this.playerListTexts[sessionId].destroy();
        delete this.playerListTexts[sessionId];
      }
      // Re-position remaining texts
      Object.keys(this.playerListTexts).forEach((sid, index) => {
        this.playerListTexts[sid].setY(index * 30);
      });
    });

    this.onStateChangeRef = this.room.onStateChange((state) => {
      if (this.isTransitioning) return;
      if (state.started === true) {
        this.startGame();
      }
    });

    this.onMessageRef = this.room.onMessage('start_game', () => {
      if (this.isTransitioning) return;
      this.startGame();
    });

    // Dots for "Waiting"
    this.waitText = this.add
      .text(width / 2, height - 50, 'Waiting for players to be ready...', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#00d4ff',
      })
      .setOrigin(0.5);

    this.dotTimer = 0;
    this.dots = 0;

    this.setupJoystickLogic();
  }

  createButton(x, y, label, onClick) {
    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#fff',
      backgroundColor: '#333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    text.on('pointerdown', onClick);
    text.on('pointerover', () => text.setTint(0xcccccc));
    text.on('pointerout', () => text.clearTint());

    return text;
  }

  setupJoystickLogic() {
    const btn = this.createButton(this.scale.width - 120, 30, 'JOYSTICK: DISCONNESSO', async () => {
      const plugin = this.plugins.get('SerialBridgePlugin');
      if (!plugin) return;

      if (plugin.connected) {
        await plugin.disconnect();
        btn.setText('JOYSTICK: DISCONNESSO').setBackgroundColor('#333');
      } else {
        await plugin.connect();
        btn.setText('JOYSTICK: CONNESSO').setBackgroundColor('#00aa00');
      }
    });

    // Auto color on start if already connected from a previous scene
    const plugin = this.plugins.get('SerialBridgePlugin');
    if (plugin && plugin.connected) {
      btn.setText('JOYSTICK: CONNESSO').setBackgroundColor('#00aa00');
    }
  }

  updatePlayerText(player, sessionId) {
    if (!this.playerListTexts[sessionId]) return;
    const isMe = sessionId === this.room.sessionId;
    const displayName = player.name ? player.name : `Player ${sessionId.substring(0, 4)}`;
    const prefix = isMe ? '(You)' : '';
    const role = player.role ? player.role.toUpperCase() : 'Selecting...';
    const readyStr = player.isReady ? '[READY]' : '[NOT READY]';
    this.playerListTexts[sessionId].setText(`${prefix} ${displayName} | Role: ${role} | ${readyStr}`);
  }

  updateButtons(myPlayer = null) {
    if (!myPlayer) myPlayer = this.room.state.players.get(this.room.sessionId);
    if (!myPlayer) return;

    // Highlight selected role
    this.btnHuman.setBackgroundColor(myPlayer.role === 'human' ? '#007700' : '#333');
    this.btnMonster.setBackgroundColor(myPlayer.role === 'monster' ? '#770000' : '#333');

    // Make role buttons grey out if ready
    if (this.amIReady) {
      this.btnHuman.setAlpha(0.5);
      this.btnMonster.setAlpha(0.5);
    } else {
      this.btnHuman.setAlpha(1);
      this.btnMonster.setAlpha(1);
    }

    // Update ready button
    if (myPlayer.role === '') {
      this.btnReady.setAlpha(0.5);
      this.btnReady.setBackgroundColor('#333');
      this.btnReady.setText('READY');

      this.bgHuman.setAlpha(0);
      this.bgMonster.setAlpha(0);
      this.humanSprite.setVisible(false);
      this.monsterSprite.setVisible(false);
    } else {
      this.btnReady.setAlpha(1);
      this.btnReady.setBackgroundColor(this.amIReady ? '#00aaaa' : '#333');
      this.btnReady.setText(this.amIReady ? 'CANCEL READY' : 'READY');

      if (myPlayer.role === 'human') {
        this.tweens.add({ targets: this.bgHuman, alpha: 0.8, duration: 500 });
        this.tweens.add({ targets: this.bgMonster, alpha: 0, duration: 500 });
        this.humanSprite.setVisible(true);
        this.monsterSprite.setVisible(false);
      } else if (myPlayer.role === 'monster') {
        this.tweens.add({ targets: this.bgMonster, alpha: 0.8, duration: 500 });
        this.tweens.add({ targets: this.bgHuman, alpha: 0, duration: 500 });
        this.humanSprite.setVisible(false);
        this.monsterSprite.setVisible(true);
      }
    }
  }

  startGame() {
    this.isTransitioning = true;

    if (this.bgMusic) {
      this.bgMusic.stop();
    }

    // Remove listeners so they don't fire while GameScene is running
    // In Colyseus 0.14+, we can remove the specific references. Or just wipe all for this component.
    this.room.removeAllListeners();

    this.scene.start('GameScene', { client: this.client, room: this.room });
  }

  update(time, delta) {
    // Pulsing ring
    this.ringScale += this.ringDir;
    if (this.ringScale > 1.08 || this.ringScale < 0.92) this.ringDir *= -1;

    const { width, height } = this.scale;
    this.ring.clear();
    this.ring.lineStyle(2, 0x00d4ff, 0.3);
    this.ring.strokeCircle(width / 2, height / 2 - 20, 120 * this.ringScale);
    this.ring.lineStyle(1, 0x00d4ff, 0.15);
    this.ring.strokeCircle(width / 2, height / 2 - 20, 80 * this.ringScale);

    // Animated dots
    this.dotTimer += delta;
    if (this.dotTimer > 500) {
      this.dotTimer = 0;
      this.dots = (this.dots + 1) % 4;
      if (this.waitText) {
        this.waitText.setText(
          'Waiting for players to be ready' + '.'.repeat(this.dots)
        );
      }
    }
  }
}
