import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';

const SERVER_URL = 'ws://localhost:2567';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.createBackground();
        this.createMonsters();
        this.createTitle();
        this.createButtons();

        this.menuMusic = this.sound.add('menu_music', { loop: true, volume: 0.6 });

        if (this.sound.locked) {
            this.sound.once(Phaser.Sound.Events.UNLOCKED, () => this.menuMusic.play());
        } else {
            this.menuMusic.play();
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.menuMusic.stop());
    }

    // -------------------------------------------------------------------
    // Sfondo: sfumatura radiale rosso (centro) → nero (bordi)
    // -------------------------------------------------------------------
    createBackground() {
        const W = 800, H = 600;
        const key = 'menu_bg_canvas';

        if (!this.textures.exists(key)) {
            const canvas = this.textures.createCanvas(key, W, H);
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 520);
            grad.addColorStop(0, '#7A0000');
            grad.addColorStop(0.45, '#2E0000');
            grad.addColorStop(1, '#000000');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
            canvas.refresh();
        }

        this.add.image(400, 300, key).setDepth(0);
    }

    // -------------------------------------------------------------------
    // Mostri in cima: Mostro1 (sx) — Mostro3 (centro) — Mostro2 (dx)
    // -------------------------------------------------------------------
    createMonsters() {
        const y = 194; // +100px

        // Mostro1: spritesheet 32×32, 3 col × 3 righe → 9 frame
        this.add.sprite(155, y, 'mostro1')
            .setScale(3.08) // 2.8 × 1.1
            .setDepth(2)
            .play('mostro1_anim');

        // Mostro3 (centro): spritesheet 256×256, 2 righe — +200%
        this.add.sprite(400, y, 'mostro3')
            .setScale(1.254) // 0.418 × 3
            .setDepth(2)
            .play('mostro3_anim');

        // Mostro2 (dx): spritesheet 256×256, 6 righe
        this.add.sprite(645, y, 'mostro2')
            .setScale(0.418) // 0.38 × 1.1
            .setDepth(2)
            .play('mostro2_anim');
    }

    // -------------------------------------------------------------------
    // Titolo
    // -------------------------------------------------------------------
    createTitle() {
        this.add.image(400, 309, 'title') // +100px
            .setOrigin(0.5)
            .setDepth(3)
            .setScale(0.5);
    }

    // -------------------------------------------------------------------
    // Bottoni: frame 0 = normale, frame 1 = hover
    // -------------------------------------------------------------------
    createButtons() {
        const cx = 400;
        // scale 6 (2 × 3 = +200%), spacing 80px tra i centri
        this.createSpriteButton(cx, 410, 'storia_btn', () => this.scene.start('Scene2'));
        this.createSpriteButton(cx, 490, 'multi_btn', () => this.connectAndJoin());
        this.createSpriteButton(cx, 570, 'crediti_btn', () => this.openCredits());
    }

    createSpriteButton(x, y, texture, callback) {
        const btn = this.add.sprite(x, y, texture, 0)
            .setDepth(4)
            .setOrigin(0.5)
            .setScale(6)
            .setInteractive({ useHandCursor: true, pixelPerfect: true });

        btn.anims.stop(); // nessuna animazione automatica
        btn.setFrame(0);  // forza frame statico iniziale

        btn.on('pointerover', () => btn.setFrame(1));
        btn.on('pointerout', () => btn.setFrame(0));
        btn.on('pointerdown', callback);

        return btn;
    }

    // -------------------------------------------------------------------
    // Crediti (placeholder — aggiungere SceneCrediti se necessario)
    // -------------------------------------------------------------------
    openCredits() {
        console.log('Crediti');
    }

    // -------------------------------------------------------------------
    // Connessione multiplayer (logica invariata)
    // -------------------------------------------------------------------
    async connectAndJoin() {
        console.log('Connecting…');
        try {
            const client = new Colyseus.Client(SERVER_URL);
            const room = await client.joinOrCreate('game_room');
            console.log('Joined! Waiting for room…');
            this.scene.start('WaitingRoomScene', { client, room });
        } catch (err) {
            console.error(err);
            console.log('Connection failed. Is the server running?');
        }
    }
}
