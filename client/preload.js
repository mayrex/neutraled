export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    preload() {
        // ── Scene 1 (Menu) ──────────────────────────────────────────────────
        this.load.image('background_sky', './scene1/scene1_background_sky.png');
        this.load.image('title', './scene1/scene1_title.png');
        for (let i = 1; i <= 10; i++) {
            this.load.image(`background_cloud${i}`, `./scene1/scene1_background_cloud${i}.png`);
        }
        for (let i = 1; i <= 3; i++) {
            this.load.image(`secret_character_frame${i}`, `./scene1/scene1_secret_character_frame${i}.png`);
        }
        for (let i = 1; i <= 3; i++) {
            this.load.image(`play_button_frame${i}`, `./scene1/scene1_play_button_frame${i}.png`);
        }
        for (let i = 1; i <= 3; i++) {
            this.load.image(`option_button_frame${i}`, `./scene1/scene1_option_button_frame${i}.png`);
        }

        // ── Scene 2 (Intro) ─────────────────────────────────────────────────
        this.load.image('space_background_frame1', './scene2/scene2_space_background_frame1.png');
        this.load.image('space_background_frame2', './scene2/scene2_space_background_frame2.png');
        this.load.image('secret_character', './scene2/scene2_secret_character.png');
        this.load.audio('secret_character_talking_sound', './scene2/scene2_secret_character_talking_sound.mp3');
        // Immagini narrative numerate
        this.load.image('scene2_img1', './scene2/scene2_1.jpeg');
        this.load.image('scene2_img2', './scene2/scene2_2.jpeg');
        this.load.image('scene2_img3', './scene2/scene2_3.jpeg');
        this.load.image('scene2_img4', './scene2/scene2_4.jpeg');
        // Spritesheet parlante (5°) – trattato come immagine normale
        this.load.image('scene2_sprite5', './scene2/scene2_5.jpeg');

        // ── Scene 3 (Castello – tilemap + player umano) ─────────────────────
        this.load.tilemapTiledJSON('map', './scene3/tile_map/map.json');
        this.load.image('tiles', './scene3/tile_map/spritesheet.png');
        this.load.image('player', './scene3/scene3_player.png');
        this.load.image('npc1', './scene3/player.png');
        this.load.image('uscita', './scene3/scene3_uscita.png');

        // Player umano – frame animazioni camminata
        this.load.image('upwalk_frame1', './scene3/scene3_upwalking_frame1.png');
        this.load.image('upwalk_frame2', './scene3/scene3_upwalking_frame2.png');
        this.load.image('upwalk_frame3', './scene3/scene3_upwalking_frame3.png');
        this.load.image('leftwalk_frame1', './scene3/scene3_leftwalking_frame1.png');
        this.load.image('leftwalk_frame2', './scene3/scene3_leftwalking_frame2.png');
        this.load.image('rightwalk_frame1', './scene3/scene3_rightwalking_frame1.png');
        this.load.image('rightwalk_frame2', './scene3/scene3_rightwalking_frame2.png');
        this.load.image('downwalk_frame2', './scene3/scene3_downwalking_frame2.png');
        this.load.image('downwalk_frame3', './scene3/scene3_downwalking_frame3.png');

        // ── Scene 4 (Tutorial battaglia) ────────────────────────────────────
        this.load.image('bullet', './scene4/scene4_bullet1.png');
        this.load.image('bullet1', './scene4/scene4_bullet1.png');
        this.load.image('attack', './scene4/scene4_bullet1.png');
        this.load.image('bullets', './scene4/scene4_bullet1.png');
        this.load.image('shield', './scene4/scene4_player_shield.png');
        this.load.image('player_shield', './scene4/scene4_player_shield.png');
        this.load.image('player_soul', './scene4/scene4_player_shield.png');

        // ── Scene 5 (Villaggio – tilemap + nemici) ──────────────────────────
        this.load.tilemapTiledJSON('map1', './scene5/tile_map/map.json');
        this.load.image('tiles1', './scene5/tile_map/spritesheet.png');
        this.load.image('enemy1', './scene5/npc1_frame1.png');
        this.load.image('enemy2', './scene5/enemy2_frame1.png');

        // ── Scene 8 (Dungeon – tilemap + mostro player + enemy3) ────────────
        this.load.tilemapTiledJSON('map2', './scene8/tile_map/map.json');
        this.load.image('tiles2', './scene8/tile_map/spritesheet.png');
        this.load.image('monster', './scene8/monster_player.png');
        this.load.image('monster_player_stand_frame', './scene8/monster_player.png');
        this.load.image('npc_monster', './scene8/monster_player.png');
        this.load.image('monster_preview', './scene8/monster_player.png');
        this.load.image('enemy3_frame1', './scene8/enemy3_frame1.png');

        // Mostro player – frame animazioni camminata
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

        // ── Scene 10 (Torre – tilemap + enemy4) ─────────────────────────────
        this.load.tilemapTiledJSON('map3', './scene10/tile_map/map.json');
        this.load.image('tiles3', './scene10/tile_map/spritesheet.png');
        this.load.image('enemy4_frame1', './scene10/enemy4_frame1.png');

        // ── Scene 11 (Boss 1 – slashes) ─────────────────────────────────────
        this.load.image('player_slash', './scene11/player_slash.png');

        // ── Scene 12 (Corridoio – tilemap + enemy5) ─────────────────────────
        this.load.tilemapTiledJSON('map4', './scene12/tile_map/map.json');
        this.load.image('tiles4', './scene12/tile_map/spritesheet.png');
        this.load.image('enemy5_frame1', './scene12/enemy5_frame1.png');

        // ── Scene 14 (Piano finale – tilemap) ───────────────────────────────
        this.load.tilemapTiledJSON('map5', './scene14/tile_map/map.json');
        this.load.image('tiles5', './scene14/tile_map/spritesheet.png');

        // ── Scene 15 (Boss finale – Tifone) ─────────────────────────────────
        this.load.image('background', './scene15/background.png');
        this.load.image('background_wc', './scene15/background_with_castle.png');
        this.load.image('tifone_frame1', './scene15/tifone_frame1.png');

        // ── GameScene Multiplayer ────────────────────────────────────────────
        this.load.image('plains_bg', './plain/Map test final.png');
        this.load.image('human_preview', './scene3/scene3_player.png');
        this.load.image('npc', './scene3/player.png');

        // ── Evoluzione (trasformazione) ──────────────────────────────────────
        this.load.spritesheet('evoluzione', './evoluzione/evoluzione.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        // ── Animazioni player umano ──────────────────────────────────────────
        this.anims.create({
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

        this.anims.create({
            key: 'leftwalk',
            frames: [
                { key: 'leftwalk_frame1' },
                { key: 'leftwalk_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'rightwalk',
            frames: [
                { key: 'rightwalk_frame1' },
                { key: 'rightwalk_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'stand',
            frames: [{ key: 'player' }],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'player' },
                { key: 'downwalk_frame2' },
                { key: 'downwalk_frame3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        // ── Animazioni player mostro ─────────────────────────────────────────
        this.anims.create({
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

        this.anims.create({
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

        this.anims.create({
            key: 'monster_rightwalk',
            frames: [
                { key: 'monster_player_rightwalking_frame1' },
                { key: 'monster_player_rightwalking_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'monster_leftwalk',
            frames: [
                { key: 'monster_player_leftwalking_frame1' },
                { key: 'monster_player_leftwalking_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'monster_stand',
            frames: [{ key: 'monster_player_downwalking_frame1' }],
            frameRate: 6,
            repeat: -1
        });

        // ── Animazioni scena 2 (sky) ─────────────────────────────────────────
        this.anims.create({
            key: 'skyanimation',
            frames: [
                { key: 'space_background_frame1' },
                { key: 'space_background_frame2' }
            ],
            frameRate: 2,
            repeat: -1
        });

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

        // ── Animazioni bottoni menu ──────────────────────────────────────────
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

        // ── Animazione trasformazione ────────────────────────────────────────
        this.anims.create({
            key: 'evoluzione_anim',
            frames: this.anims.generateFrameNumbers('evoluzione', { start: 0, end: 20 }),
            frameRate: 14,
            repeat: 0,
            hideOnComplete: true
        });

        // ── Texture programmatiche collezionabili multiplayer ────────────────
        const gfx = this.add.graphics();

        gfx.fillStyle(0x2255dd, 1);
        gfx.fillCircle(16, 16, 14);
        gfx.fillStyle(0x88bbff, 1);
        gfx.fillCircle(10, 10, 5);
        gfx.generateTexture('collectible_human', 32, 32);
        gfx.clear();

        gfx.fillStyle(0x881133, 1);
        gfx.fillCircle(16, 16, 14);
        gfx.fillStyle(0xff6644, 1);
        gfx.fillCircle(10, 10, 5);
        gfx.generateTexture('collectible_monster', 32, 32);
        gfx.clear();

        gfx.fillStyle(0xccaa00, 1);
        gfx.fillCircle(16, 16, 14);
        gfx.fillStyle(0xffee88, 1);
        gfx.fillCircle(10, 10, 5);
        gfx.generateTexture('collectible_both', 32, 32);
        gfx.destroy();

        this.scene.start('MenuScene');
    }
}