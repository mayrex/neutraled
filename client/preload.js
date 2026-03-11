export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.tilemapTiledJSON('map', './scene3/tile_map/map.json');
        this.load.image('player', './scene3/scene3_player.png');
        this.load.image('npc', './scene3/player.png');
        this.load.image('bullet1', './scene4/scene4_bullet1.png');
        this.load.image('player_shield', './scene4/scene4_player_shield.png');
        this.load.image('tiles', './scene3/tile_map/spritesheet.png');
        this.load.image('player', './scene3/scene3_player.png');
        this.load.image('npc1', './scene3/player.png');
        this.load.tilemapTiledJSON('map1', './scene5/tile_map/map.json');

        // TILESET
        this.load.image('tiles1', './scene5/tile_map/spritesheet.png');

        // PLAYER + SPRITES
        this.load.image('player', './scene3/scene3_player.png');

        this.load.image('upwalk_frame1', './scene3/scene3_upwalking_frame1.png');
        this.load.image('upwalk_frame2', './scene3/scene3_upwalking_frame2.png');
        this.load.image('upwalk_frame3', './scene3/scene3_upwalking_frame3.png');

        this.load.image('leftwalk_frame1', './scene3/scene3_leftwalking_frame1.png');
        this.load.image('leftwalk_frame2', './scene3/scene3_leftwalking_frame2.png');

        this.load.image('rightwalk_frame1', './scene3/scene3_rightwalking_frame1.png');
        this.load.image('rightwalk_frame2', './scene3/scene3_rightwalking_frame2.png');

        this.load.image('downwalk_frame2', './scene3/scene3_downwalking_frame2.png');
        this.load.image('downwalk_frame3', './scene3/scene3_downwalking_frame3.png');

        //ENEMYS 
        this.load.image('upwalk_frame1', './scene3/scene3_upwalking_frame1.png');
        this.load.image('upwalk_frame2', './scene3/scene3_upwalking_frame2.png');
        this.load.image('upwalk_frame3', './scene3/scene3_upwalking_frame3.png');

        this.load.image('leftwalk_frame1', './scene3/scene3_leftwalking_frame1.png');
        this.load.image('leftwalk_frame2', './scene3/scene3_leftwalking_frame2.png');

        this.load.image('rightwalk_frame1', './scene3/scene3_rightwalking_frame1.png');
        this.load.image('rightwalk_frame2', './scene3/scene3_rightwalking_frame2.png');


        this.load.image('downwalk_frame2', './scene3/scene3_downwalking_frame2.png');
        this.load.image('downwalk_frame3', './scene3/scene3_downwalking_frame3.png');
        // TILEMAP (un solo file con ground + walls)
        this.load.tilemapTiledJSON('map1', './scene5/tile_map/map.json');

        // TILESET
        this.load.image('space_background_frame1', './scene2/scene2_space_background_frame1.png');
        this.load.image('space_background_frame2', './scene2/scene2_space_background_frame2.png');

        this.load.image('secret_character', './scene2/scene2_secret_character.png');

        this.load.audio('secret_character_talking_sound', './scene2/scene2_secret_character_talking_sound.mp3');
        // background
        this.load.image('background_sky', './scene1/scene1_background_sky.png');
        this.load.image('plains_bg', './plain/Map test final.png'); // New Map
        this.load.image('monster', './scene8/monster_player.png');

        this.load.image('player', './scene3/scene3_player.png');
        this.load.image('npc', './scene3/player.png');
        this.load.image('bullet', './scene4/scene4_bullet1.png');
        this.load.image('shield', './scene4/scene4_player_shield.png');
        // TILEMAP (un solo file con ground + walls)
        this.load.tilemapTiledJSON('map5', './scene14/tile_map/map.json');

        // TILESET
        this.load.image('tiles5', './scene14/tile_map/spritesheet.png');

        for (let i = 1; i <= 10; i++) {
            this.load.image(`background_cloud${i}`, `./scene1/scene1_background_cloud${i}.png`);
        }

        // secret character
        for (let i = 1; i <= 3; i++) {
            this.load.image(`secret_character_frame${i}`, `./scene1/scene1_secret_character_frame${i}.png`);
        }

        // play button
        for (let i = 1; i <= 3; i++) {
            this.load.image(`play_button_frame${i}`, `./scene1/scene1_play_button_frame${i}.png`);
        }

        // option button
        for (let i = 1; i <= 3; i++) {
            this.load.image(`option_button_frame${i}`, `./scene1/scene1_option_button_frame${i}.png`);
        }

        // titolo
        this.load.image('title', './scene1/scene1_title.png');

        // Missing map files from other scenes
        this.load.tilemapTiledJSON('map2', './scene8/tile_map/map.json');
        this.load.image('tiles2', './scene8/tile_map/spritesheet.png');
        this.load.tilemapTiledJSON('map3', './scene10/tile_map/map.json');
        this.load.image('tiles3', './scene10/tile_map/spritesheet.png');
        this.load.tilemapTiledJSON('map4', './scene12/tile_map/map.json');
        this.load.image('tiles4', './scene12/tile_map/spritesheet.png');

        // Missing sprites from other scenes
        this.load.image('uscita', '/scene3/scene3_uscita.png');
        this.load.image('monster_player_stand_frame', './scene8/monster_player.png');
        this.load.image('npc_monster', './scene8/monster_player.png');
        this.load.image('attack', './scene4/scene4_bullet1.png');
        this.load.image('player_slash', './scene11/player_slash.png');
        this.load.image('player_soul', './scene4/scene4_player_shield.png');
        this.load.image('human_preview', 'scene3/scene3_player.png');
        this.load.image('monster_preview', 'scene8/monster_player.png');

        // Evoluzione transform animation (320x320 → 64x64 per frame, 5 col × 5 row, 21 frame usati)
        this.load.spritesheet('evoluzione', './evoluzione/evoluzione.png', {
            frameWidth: 64,
            frameHeight: 64
        });

    }

    create() {

        this.anims.create({
            key: 'upwalk', // parola chiave
            frames: [
                { key: 'upwalk_frame1' }, // frames dell'animazione
                { key: 'upwalk_frame2' },
                { key: 'upwalk_frame1' },
                { key: 'upwalk_frame3' }
            ],
            frameRate: 6, // quanti frame al secondo
            repeat: -1  // loop infinito
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
            frames: [
                { key: 'player' },
            ],
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

        // Animazione trasformazione (21 frame, una tantum, si nasconde al termine)
        this.anims.create({
            key: 'evoluzione_anim',
            frames: this.anims.generateFrameNumbers('evoluzione', { start: 0, end: 20 }),
            frameRate: 14,
            repeat: 0,
            hideOnComplete: true
        });

        // Texture programmatiche per i collezionabili multiplayer
        const gfx = this.add.graphics();

        // Solo modalità UMANO → cerchio blu
        gfx.fillStyle(0x2255dd, 1);
        gfx.fillCircle(16, 16, 14);
        gfx.fillStyle(0x88bbff, 1);
        gfx.fillCircle(10, 10, 5);
        gfx.generateTexture('collectible_human', 32, 32);
        gfx.clear();

        // Solo modalità MOSTRO → cerchio viola/rosso
        gfx.fillStyle(0x881133, 1);
        gfx.fillCircle(16, 16, 14);
        gfx.fillStyle(0xff6644, 1);
        gfx.fillCircle(10, 10, 5);
        gfx.generateTexture('collectible_monster', 32, 32);
        gfx.clear();

        // Entrambe le modalità → cerchio dorato
        gfx.fillStyle(0xccaa00, 1);
        gfx.fillCircle(16, 16, 14);
        gfx.fillStyle(0xffee88, 1);
        gfx.fillCircle(10, 10, 5);
        gfx.generateTexture('collectible_both', 32, 32);
        gfx.destroy();

        this.scene.start("MenuScene")

    }

}