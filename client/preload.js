export default class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        // Grafica di caricamento
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 2 - 50, 'Caricamento Assets...', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

        const percentText = this.add.text(width / 2, height / 2 + 25, '0%', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
        });

        // --------------------------------------------------------
        // TUTTI GLI ASSET DEL GIOCO (Estratti da Scene 1 a 15)
        // --------------------------------------------------------

        // === SCENE 1 ===
        this.load.image('background_sky', './scene1/scene1_background_sky.png');
        for (let i = 1; i <= 10; i++) {
            this.load.image(`background_cloud${i}`, `./scene1/scene1_background_cloud${i}.png`);
        }
        for (let i = 1; i <= 3; i++) {
            this.load.image(`secret_character_frame${i}`, `./scene1/scene1_secret_character_frame${i}.png`);
            this.load.image(`play_button_frame${i}`, `./scene1/scene1_play_button_frame${i}.png`);
            this.load.image(`option_button_frame${i}`, `./scene1/scene1_option_button_frame${i}.png`);
        }
        this.load.image('title', './scene1/scene1_title.png');
        this.load.spritesheet('mostro1', './scene1/Mostro1.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('mostro2', './scene1/Mostro2.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('mostro3', './scene1/Mostro3.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('storia_btn', './scene1/Storia bottone.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('multi_btn', './scene1/Multiplayer Bottone.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('crediti_btn', './scene1/Crediti Bottone.png', { frameWidth: 64, frameHeight: 64 });

        this.load.audio('menu_music', './scene1/menu.mp3');


        // === SCENE 2 ===
        this.load.image('space_background_frame1', './scene2/scene2_space_background_frame1.png');
        this.load.image('space_background_frame2', './scene2/scene2_space_background_frame2.png');
        this.load.image('secret_character', './scene2/scene2_secret_character.png');
        this.load.audio('secret_character_talking_sound', './scene2/scene2_secret_character_talking_sound.mp3');

        // === SCENE 3 ===
        this.load.tilemapTiledJSON('map', './scene3/tile_map/map.json');
        this.load.image('tiles', './scene3/tile_map/spritesheet.png');
        this.load.image('player', './scene3/scene3_player.png');
        this.load.image('npc1', './scene2/scene2_secret_character.png');
        this.load.image('upwalk_frame1', './scene3/scene3_upwalking_frame1.png');
        this.load.image('upwalk_frame2', './scene3/scene3_upwalking_frame2.png');
        this.load.image('upwalk_frame3', './scene3/scene3_upwalking_frame3.png');
        this.load.image('leftwalk_frame1', './scene3/scene3_leftwalking_frame1.png');
        this.load.image('leftwalk_frame2', './scene3/scene3_leftwalking_frame2.png');
        this.load.image('rightwalk_frame1', './scene3/scene3_rightwalking_frame1.png');
        this.load.image('rightwalk_frame2', './scene3/scene3_rightwalking_frame2.png');
        this.load.image('downwalk_frame2', './scene3/scene3_downwalking_frame2.png');
        this.load.image('downwalk_frame3', './scene3/scene3_downwalking_frame3.png');
        this.load.image('uscita', './scene3/scene3_uscita.png');

        // Monster Player Animations
        this.load.image('monster_player_stand_frame', './scene8/monster_player.png');
        this.load.image('monster_player_upwalking_frame1', './scene8/monster_player_upwalking_frame1.png');
        this.load.image('monster_player_upwalking_frame2', './scene8/monster_player_upwalking_frame2.png');
        this.load.image('monster_player_upwalking_frame3', './scene8/monster_player_upwalking_frame3.png');
        this.load.image('monster_player_downwalking_frame1', './scene8/monster_player_downwalking_frame1.png');
        this.load.image('monster_player_downwalking_frame2', './scene8/monster_player_downwalking_frame2.png');
        this.load.image('monster_player_downwalking_frame3', './scene8/monster_player_downwalking_frame3.png');
        this.load.image('monster_player_rightwalking_frame1', './scene8/monster_player_right_frame1.png');
        this.load.image('monster_player_rightwalking_frame2', './scene8/monster_player_right_frame2.png');
        this.load.image('monster_player_leftwalking_frame1', './scene8/monster_player_left_frame1.png');
        this.load.image('monster_player_leftwalking_frame2', './scene8/monster_player_left_frame2.png');

        // Duplicate names to match direct calls in Scene 15:
        this.load.image('monster_player_right_frame1', './scene8/monster_player_right_frame1.png');
        this.load.image('monster_player_right_frame2', './scene8/monster_player_right_frame2.png');
        this.load.image('monster_player_left_frame1', './scene8/monster_player_left_frame1.png');
        this.load.image('monster_player_left_frame2', './scene8/monster_player_left_frame2.png');

        // === SCENE 4 ===
        this.load.image('bullet1', './scene4/scene4_bullet1.png');
        this.load.image('player_shield', './scene4/scene4_player_shield.png');

        // === SCENE 5 ===
        this.load.tilemapTiledJSON('map1', './scene5/tile_map/map.json');
        this.load.image('tiles1', './scene5/tile_map/spritesheet.png');
        this.load.spritesheet('enemy1', './scene5/npc1_animation.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('enemy2', './scene5/enemy2_animation.png', { frameWidth: 32, frameHeight: 32 });
        this.load.audio('scene5_audio', './sounds/scene5_soundtrack.mp3');

        // === SCENE 6 & 7 ===
        this.load.image('bullet', './scene4/scene4_bullet1.png');
        this.load.image('shield', './scene4/scene4_player_shield.png');
        this.load.audio('scene6_audio', './sounds/scene6_fightsoundtrack.mp3');
        this.load.audio('scene7_audio', './sounds/scene7_fightsoundtrack.mp3');

        // === SCENE 8 ===
        this.load.tilemapTiledJSON('map2', './scene8/tile_map/map.json');
        this.load.image('tiles2', './scene8/tile_map/spritesheet.png');
        this.load.image('enemy3_frame1', './scene8/enemy3_frame1.png');

        // === SCENE 10 ===
        this.load.tilemapTiledJSON('map3', './scene10/tile_map/map.json');
        this.load.image('tiles3', './scene10/tile_map/spritesheet.png');
        this.load.spritesheet('enemy4', './scene10/enemy4_animation.png', { frameWidth: 32, frameHeight: 32 });

        // === SCENE 11 & 13 ===
        this.load.image('attack', './scene4/scene4_bullet1.png');
        this.load.image('player_slash', './scene11/player_slash.png');
        this.load.image('player_soul', './scene4/scene4_player_shield.png');

        // === SCENE 12 ===
        this.load.tilemapTiledJSON('map4', './scene12/tile_map/map.json');
        this.load.image('tiles4', './scene12/tile_map/spritesheet.png');
        this.load.image('enemy5_frame1', './scene12/enemy5_frame1.png');
        this.load.spritesheet('scene2_sprite5', './scene2/carousel/scene2_5.jpeg', {
            frameWidth: 344,
            frameHeight: 384
        });
        // Immagini carousel (riempiono la metà superiore dello schermo)
        for (let i = 1; i <= 5; i++) {
            this.load.image(`scene2_${i}`, `./scene2/carousel/scene2_${i}.jpeg`);
        }
        // === SCENE 14 ===
        this.load.tilemapTiledJSON('map5', './scene14/tile_map/map.json');
        this.load.image('tiles5', './scene14/tile_map/spritesheet.png');
        this.load.audio('scene14_audio', './sounds/scene14_soundtrack.mp3');

        // === SCENE 15 ===
        this.load.image('background', './scene15/background.png');
        this.load.image('background_wc', './scene15/background_with_castle.png');
        this.load.image('sky', './scene1/scene1_background_sky.png');
        this.load.image('tifone_frame1', './scene15/tifone_frame1.png');
        this.load.image('bullets', './scene4/scene4_bullet1.png');
        this.load.image('tifone_fulmine', './scene15/tifone_fulmine.png');
        this.load.image('tifone_laser', './scene15/tifone_laser.png');
        this.load.spritesheet('tifone_onde_laterali_frame1', './scene15/onde_laterali_animation.png', { frameWidth: 48, frameHeight: 28 });
        this.load.image('tifone_onda_frontale', './scene15/tifone_onda_frontale.png');
        this.load.spritesheet('tifone_tornado', './scene15/tifone_tornado_animation.png', { frameWidth: 36, frameHeight: 50 });
        this.load.audio('scene15_audio', './sounds/scene15_fight_soundtrack.mp3');

        // === OGGETTI AMBIENTALI ===
        this.load.image('Cespuglio', './oggetti ambientali/Cespuglio.png');
        this.load.image('ABunchOfFlowers', './oggetti ambientali/ABunchOfFlowers.png');
        this.load.image('Teschio', './oggetti ambientali/Teschio.png');
        this.load.image('chebellaLANTERNA', './oggetti ambientali/chebellaLANTERNA.png');

        // === MULTIPLAYER ASSETS ===
        this.load.tilemapTiledJSON('mp_map', './multiplayer/Tilemap mp.tmj');
        this.load.image('mp_tiles', './multiplayer/ezgif-819d516e06a53a6e (1) (1).png');
        this.load.image('monster', './scene8/monster_player.png');
        this.load.image('human_preview', './scene3/scene3_player.png');
        this.load.image('monster_preview', './scene8/monster_player.png');

        // Collectibles used in GameScene.js
        this.load.image('collectible_human', './oggetti ambientali/ABunchOfFlowers.png');
        this.load.image('collectible_monster', './oggetti ambientali/Teschio.png');
        this.load.image('collectible_both', './oggetti ambientali/Cespuglio.png');

        // Transformation
        this.load.spritesheet('evoluzione', './evoluzione/evoluzione.png', { frameWidth: 64, frameHeight: 64 });

        // Multiplayer Music & Sounds
        this.load.audio('waiting_room_music', './multiplayer/Waiting-for-you-to-connect.mp3');
        this.load.audio('gamescene_music', './multiplayer/Climbing a huge mountain.mp3');
        this.load.audio('veleno_sound', './multiplayer/veleno.mp3');
        this.load.audio('fire_sound', './multiplayer/fire.mp3');
        this.load.audio('taser_sound', './multiplayer/taser.mp3');
    }

    create() {
        this.anims.create({
            key: 'flymoving',
            frames: [
                { key: 'secret_character_frame1' },
                { key: 'secret_character_frame2' },
                { key: 'secret_character_frame3' },
                { key: 'secret_character_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'play_button_pressed',
            frames: [
                { key: 'play_button_frame1' },
                { key: 'play_button_frame2' },
                { key: 'play_button_frame3' }
            ],
            frameRate: 4,
            repeat: 0
        });

        this.anims.create({
            key: 'play_button_depressed',
            frames: [
                { key: 'play_button_frame3' },
                { key: 'play_button_frame2' },
                { key: 'play_button_frame1' }
            ],
            frameRate: 4,
            repeat: 0
        });

        this.anims.create({
            key: 'option_button_pressed',
            frames: [
                { key: 'option_button_frame1' },
                { key: 'option_button_frame2' },
                { key: 'option_button_frame3' }
            ],
            frameRate: 4,
            repeat: 0
        });

        this.anims.create({
            key: 'option_button_depressed',
            frames: [
                { key: 'option_button_frame3' },
                { key: 'option_button_frame2' },
                { key: 'option_button_frame1' }
            ],
            frameRate: 4,
            repeat: 0
        });

        this.anims.create({
            key: 'evoluzione_anim',
            frames: this.anims.generateFrameNumbers('evoluzione', { start: 0, end: 4 }), // Assuming a short animation, adjust if frames are more
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'scene2_talk',
            frames: this.anims.generateFrameNumbers('scene2_sprite5', { start: 0, end: 7 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'mostro1_anim',
            frames: this.anims.generateFrameNumbers('mostro1', { start: 0, end: 8 }),
            frameRate: 7,
            repeat: -1
        });
        this.anims.create({
            key: 'mostro2_anim',
            frames: this.anims.generateFrameNumbers('mostro2', { start: 0, end: 5 }),
            frameRate: 7,
            repeat: -1
        });
        this.anims.create({
            key: 'mostro3_anim',
            frames: this.anims.generateFrameNumbers('mostro3', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        // NPC Enemy animations (per scene5 e multiplayer GameScene)
        if (!this.anims.exists('enemy1_walk')) this.anims.create({
            key: 'enemy1_walk',
            frames: this.anims.generateFrameNumbers('enemy1', { start: 0, end: 2 }), // Assuming 3 frames
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('enemy2_walk')) this.anims.create({
            key: 'enemy2_walk',
            frames: this.anims.generateFrameNumbers('enemy2', { start: 0, end: 2 }), // Assuming 3 frames
            frameRate: 6,
            repeat: -1
        });

        // Player animations
        if (!this.anims.exists('upwalk')) this.anims.create({
            key: 'upwalk',
            frames: [
                { key: 'upwalk_frame1' },
                { key: 'upwalk_frame2' },
                { key: 'upwalk_frame1' },
                { key: 'upwalk_frame3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('leftwalk')) this.anims.create({
            key: 'leftwalk',
            frames: [
                { key: 'leftwalk_frame1' },
                { key: 'leftwalk_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('rightwalk')) this.anims.create({
            key: 'rightwalk',
            frames: [
                { key: 'rightwalk_frame1' },
                { key: 'rightwalk_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('stand')) this.anims.create({
            key: 'stand',
            frames: [
                { key: 'player' },
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('walk')) this.anims.create({
            key: 'walk',
            frames: [
                { key: 'player' },
                { key: 'downwalk_frame2' },
                { key: 'downwalk_frame3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        // Monster player animations
        if (!this.anims.exists('monster_upwalk')) this.anims.create({
            key: 'monster_upwalk',
            frames: [
                { key: 'monster_player_upwalking_frame2' },
                { key: 'monster_player_upwalking_frame1' },
                { key: 'monster_player_upwalking_frame3' },
                { key: 'monster_player_upwalking_frame1' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_downwalk')) this.anims.create({
            key: 'monster_downwalk',
            frames: [
                { key: 'monster_player_downwalking_frame2' },
                { key: 'monster_player_downwalking_frame1' },
                { key: 'monster_player_downwalking_frame3' },
                { key: 'monster_player_downwalking_frame1' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_rightwalk')) this.anims.create({
            key: 'monster_rightwalk',
            frames: [
                { key: 'monster_player_rightwalking_frame1' },
                { key: 'monster_player_rightwalking_frame2' },
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_leftwalk')) this.anims.create({
            key: 'monster_leftwalk',
            frames: [
                { key: 'monster_player_leftwalking_frame1' },
                { key: 'monster_player_leftwalking_frame2' },
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_stand')) this.anims.create({
            key: 'monster_stand',
            frames: [
                { key: 'monster_player_downwalking_frame1' },
            ],
            frameRate: 6,
            repeat: -1
        });

        this.showStartPrompt();
    }

    showStartPrompt() {
        const W = 800, H = 600;

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(10);

        const label = this.add.text(W / 2, H / 2, 'CLICK PER INIZIARE', {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11);

        this.tweens.add({
            targets: label,
            alpha: 0,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        this.input.once('pointerdown', () => {
            overlay.destroy();
            label.destroy();
            this.scene.start('MenuScene');
        });
    }
}
