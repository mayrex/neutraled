import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';

const SERVER_URL = 'ws://localhost:2567';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        // world
        this.worldWidth = 800;
        this.worldHeight = 600;

        // clouds
        this.clouds = [];

        // secret character
        this.secretCharacter = null;
        this.secretDirection = 1;
        this.frameWaiter = 60;
    }

    init() {
        const w = this.worldWidth;
        const h = this.worldHeight;

        this.cloudConfig = [
            { x: (w / 5 * 1) - 60, y: (h / 5 * 1) - 60, speed: 1.5 },
            { x: (w / 5 * 2) - 60, y: (h / 5 * 2) - 60, speed: 2 },
            { x: (w / 5 * 3) - 60, y: (h / 5 * 3) - 60, speed: 1 },
            { x: (w / 5 * 4) - 60, y: (h / 5 * 4) - 60, speed: 2 },
            { x: (w / 5 * 5) - 60, y: (h / 5 * 5) - 60, speed: 1 },
            { x: (w / 5 * 1) - 60, y: (h / 5 * 3) - 60, speed: 2 },
            { x: (w / 5 * 1) - 60, y: (h / 5 * 5) - 60, speed: 1.5 },
            { x: (w / 5 * 3) - 60, y: (h / 5 * 5) - 60, speed: 2 },
            { x: (w / 5 * 4) - 60, y: (h / 5 * 1) - 60, speed: 2 },
            { x: (w / 5 * 5) - 60, y: (h / 5 * 2) - 60, speed: 2 }
        ];

        this.frameWaiter = 60;
    }

    create() {
        this.createBackground();
        this.createClouds();
        this.createSecretCharacter();
        this.createUI();
        this.sound.play("menu", { loop: true });
    }
    update() {
        this.updateClouds();
        this.updateSecretCharacter();
    }
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

    createBackground() {

        this.add.image(0, 0, 'background_sky')
            .setScale(1.6)
            .setDepth(1);

    }

    createClouds() {

        this.cloudConfig.forEach((c, i) => {

            const cloud = this.add.image(
                c.x,
                c.y,
                `background_cloud${i + 1}`
            )
                .setDepth(2)
                .setScale(i >= 7 ? 2 : 1.5)
                .setOrigin(0);

            cloud.speed = c.speed;

            this.clouds.push(cloud);

        });

    }

    createSecretCharacter() {

        this.secretCharacter = this.add.sprite(
            this.worldWidth / 2,
            this.worldHeight / 2,
            'secret_character'
        )
            .setDepth(3)
            .setScale(4)
            .setFlipX(true);

        this.secretCharacter.play('flymoving');

    }

    createUI() {

        this.createButton(
            this.worldWidth / 2,
            this.worldHeight / 2 + 150,
            'play_button',
            'play_button_pressed',
            'play_button_depressed',
            () => this.scene.start('Scene2')
        );

        this.createButton(
            this.worldWidth / 2,
            this.worldHeight / 2 + 220,
            'option_button',
            'option_button_pressed',
            'option_button_depressed',
            () => this.connectAndJoin()
        );

        this.add.image(
            this.worldWidth / 2,
            this.worldHeight / 5,
            'title'
        )
            .setOrigin(0.5)
            .setDepth(5)
            .setScale(0.5);

    }

    createButton(x, y, texture, pressAnim, releaseAnim, callback) {

        const button = this.add.sprite(x, y, texture, 0) // frame iniziale
            .setDepth(3)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        button.play(releaseAnim); // stato iniziale del bottone

        button.on('pointerover', () => {
            button.play(pressAnim, true);
        });

        button.on('pointerout', () => {
            button.play(releaseAnim, true);
        });

        button.on('pointerdown', callback);

        return button;
    }

    updateClouds() {

        this.clouds.forEach((cloud, i) => {

            cloud.x += cloud.speed;
            cloud.y += cloud.speed;

            if (cloud.x > this.worldWidth + 100) cloud.x = -200 - (i * 20);
            if (cloud.y > this.worldHeight) cloud.y = -200 - (i * 20);

        });

    }

    updateSecretCharacter() {

        if (this.frameWaiter === 30) {

            this.secretCharacter.y += 5 * this.secretDirection;
            this.secretDirection *= -1;

            this.frameWaiter = 60;

        } else {

            this.frameWaiter--;

        }

    }


}
