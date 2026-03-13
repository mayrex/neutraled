
export default class Scene3 extends Phaser.Scene {

    constructor() {
        super('Scene3');

        this.map = null;
        this.tileset = null;
        this.groundLayer = null;
        this.wallsLayer = null;
        this.player = null;
        this.keys = null;
        this.playerspeed = 120;
        this.guide_text = null;
        this.guide_obj = null;
        this.npc1 = null;
        this.npc1_x = null;
        this.npc1_y = null;
        this.rect_for_textbox = null;
        this.rect_for_textbox_border = null;
        this.is_camera_moving = true;
        this.guide_text_string = [
            "eccoti qui,il tanto atteso eroe",
            "è l'ora di passare all'azione",
            "come primo passo di questa avventura ti insegnerò a neutralizzare i mostri",
            "devi sapere che ogni mostro tenterà di attaccare la tua anima",
            "il tuo obbiettivo è quello di parare i loro colpi e neutralizzarli",
            "adesso facciamo pratica"
        ];

        this.dialogueIndex = 0;
        this.dialogueActive = false;
        this.enterKey = null;


        this.afterTutorialShown = false;

        this.uiCamera = null;



        this.uscita = null;
        this.uscita_x = 151 * 16;
        this.uscita_y = 3 * 16;



    }



    create() {


        if (!this.scene.isActive('SceneUI')) {
            this.scene.launch('SceneUI');
        }
        this.scene.bringToTop('SceneUI');





        // input
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            interact: 'ENTER'
        });

        this.enterKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );

        // tilemap
        this.map = this.make.tilemap({ key: 'map' });
        this.tileset = this.map.addTilesetImage('spritefusion', 'tiles');

        this.groundLayer = this.map.createLayer('ground', this.tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('walls', this.tileset, 0, 0);




        // player con fisica arcade
        const spawnX = this.map.widthInPixels / 2 - 1210; // esempio posizione spawn
        const spawnY = this.map.heightInPixels / 2 + 700;

        this.player = this.physics.add.sprite(spawnX, spawnY, 'player');

        this.player.setCollideWorldBounds(false);


        if (this.registry.get('tutorial_done')) {
            this.player.x = this.registry.get('player_x');
            this.player.y = this.registry.get('player_y');
        }


        // camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);

        const width = Math.max(this.groundLayer.width, this.wallsLayer.width);
        const height = Math.max(this.groundLayer.height, this.wallsLayer.height);
        this.cameras.main.setBounds(0, 0, width, height);

        // NPC

        this.npc1_x = 16 * 20;
        this.npc1_y = 16 * 79;
        this.npc1 = this.physics.add.staticSprite(this.npc1_x, this.npc1_y, 'npc1').setScale(1);

        this.physics.add.collider(this.player, this.npc1);

        //USCITA

        this.uscita = this.physics.add.staticSprite(
            this.uscita_x,
            this.uscita_y,
            'uscita'
        ).setOrigin(0.5).setScale(1);


        // animazioni walking

        if (!this.anims.exists('upwalk')) this.anims.create({
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


        if (!this.anims.exists('monster_upwalk')) this.anims.create({
            key: 'monster_upwalk', // parola chiave
            frames: [
                { key: 'monster_player_upwalking_frame2' }, // frames dell'animazione
                { key: 'monster_player_upwalking_frame1' },
                { key: 'monster_player_upwalking_frame3' },
                { key: 'monster_player_upwalking_frame1' }
            ],
            frameRate: 6, // quanti frame al secondo
            repeat: -1  // loop infinito
        });

        if (!this.anims.exists('monster_downwalk')) this.anims.create({
            key: 'monster_downwalk', // parola chiave
            frames: [
                { key: 'monster_player_downwalking_frame2' }, // frames dell'animazione
                { key: 'monster_player_downwalking_frame1' },
                { key: 'monster_player_downwalking_frame3' },
                { key: 'monster_player_downwalking_frame1' }
            ],
            frameRate: 6, // quanti frame al secondo
            repeat: -1  // loop infinito
        });

        if (!this.anims.exists('monster_rightwalk')) this.anims.create({
            key: 'monster_rightwalk', // parola chiave
            frames: [
                { key: 'monster_player_rightwalking_frame1' }, // frames dell'animazione
                { key: 'monster_player_rightwalking_frame2' },
            ],
            frameRate: 6, // quanti frame al secondo
            repeat: -1  // loop infinito
        });

        if (!this.anims.exists('monster_leftwalk')) this.anims.create({
            key: 'monster_leftwalk', // parola chiave
            frames: [
                { key: 'monster_player_leftwalking_frame1' }, // frames dell'animazione
                { key: 'monster_player_leftwalking_frame2' },
            ],
            frameRate: 6, // quanti frame al secondo
            repeat: -1  // loop infinito
        });

        if (!this.anims.exists('monster_stand')) this.anims.create({
            key: 'monster_stand', // parola chiave
            frames: [
                { key: 'monster_player_downwalking_frame1' }, // frames dell'animazione
            ],
            frameRate: 6, // quanti frame al secondo
            repeat: -1  // loop infinito
        });






        this.physics.add.overlap(
            this.player,
            this.uscita,
            this.handleExit,
            null,
            this
        );


        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_downwalking_frame1');
        }
    }

    update() {

        if (this.dialogueActive && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.nextDialogueLine();
        }


        let animation_is_playing = false;
        if (this.registry.get('tutorial_done')) {
            this.playerspeed = 120;
            this.npc1.destroy();

            animation_is_playing = false;



        }

        if (this.registry.get('tutorial_done') && !this.afterTutorialShown) {
            this.after_tutorial_script();
            this.afterTutorialShown = true;
        }
        this.moving_script();


        if (this.player.x > 16 * 12 && !this.registry.get('tutorial_done')) {

            this.playerspeed = 0;

            this.animation_script();

            animation_is_playing = true;

            if (this.registry.get('is_player_human')) {
                this.player.anims.play('stand');
            } else {
                this.player.anims.play('monster_stand');
            }

        }

        if (!animation_is_playing) {
            this.walking_script();
        }


    }




    moving_script() {

        this.player.setVelocity(0);

        if (this.keys.left.isDown) {
            this.player.setVelocityX(-this.playerspeed);
        }
        if (this.keys.right.isDown) {
            this.player.setVelocityX(this.playerspeed);
        }
        if (this.keys.up.isDown) {
            this.player.setVelocityY(-this.playerspeed);

        }
        if (this.keys.down.isDown) {
            this.player.setVelocityY(this.playerspeed);
        }

        const width = Math.max(this.groundLayer.width, this.wallsLayer.width);
        const height = Math.max(this.groundLayer.height, this.wallsLayer.height);
        const realheight = height - 957;


        if (this.player.x < 16 * 11) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                16 * 70 + 12,
                16 * 97 - 12
            );

            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                16 * 7 + 12,
                16 * 94 - 12
            );
        }

        if (this.player.y > 16 * 88) {
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                16 * 7 + 12,
                16 * 11 - 12
            );
        }

        if (this.player.x > 16 * 11 && this.player.x < 16 * 80) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                16 * 70 + 12,
                16 * 88 - 12
            );
        }
        if (this.player.y > 16 * 70 && this.player.y < 16 * 88) {
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                16 * 7 + 12,
                16 * 94 - 12
            );
        }

        if (this.player.x > 16 * 94 && this.player.x < 16 * 145 && this.player.y > 16 * 42) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                16 * 42 + 12,
                16 * 56 - 12
            );
        }

        if (this.player.x > 16 * 80 && this.player.x < 16 * 94) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                16 * 42 + 12,
                16 * 88 - 12
            )
        }

        if (this.player.y < 16 * 70 && this.player.y > 16 * 56) {
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                16 * 80 + 12,
                16 * 94 - 12
            );
        }

        if (this.player.y < 16 * 56 && this.player.y > 16 * 42) {
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                16 * 80 + 12,
                16 * 157 - 12
            );
        }

        if (this.player.y > 16 * 15 && this.player.y < 16 * 42) {
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                16 * 145 + 12,
                16 * 157 - 12
            );

        }



        if (this.player.y < 16 * 15) {
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                16 * 137 + 12,
                16 * 165 - 12
            );
        }

        if (this.player.x > 16 * 145 && this.player.x < 16 * 157) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                16 * 4 + 12,
                16 * 56 - 12
            );
        }

        if (this.player.x > 16 * 137 && this.player.x < 16 * 145 && this.player.y < 16 * 15) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                16 * 4 + 12,
                16 * 15 - 12
            );
        }

        if (this.player.x > 16 * 157 && this.player.x < 16 * 165 && this.player.y < 16 * 15) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                16 * 4 + 12,
                16 * 15 - 12
            );
        }



    }



    animation_script() {

        this.cameras.main.stopFollow();

        this.cameras.main.pan(
            this.npc1.x,
            this.npc1.y,
            1000,
            'Sine.easeInOut'
        );

        if (!this.is_camera_moving) return;

        this.time.delayedCall(1000, () => {

            this.dialogueActive = true;
            this.dialogueIndex = 0;

            this.rect_for_textbox = this.add.rectangle(
                this.npc1_x,
                this.npc1_y + 100,
                300,
                50,
                0x000000
            ).setOrigin(0.5).setStrokeStyle(2, 0xffffff);

            this.guide_text = this.add.text(
                this.rect_for_textbox.x,
                this.rect_for_textbox.y,
                this.guide_text_string[this.dialogueIndex],
                {
                    fontSize: '20px',
                    color: '#ffffff',
                    fontFamily: 'Courier, monospace',
                    stroke: '#000000',
                    strokeThickness: 4,
                    align: 'center',
                    wordWrap: { width: 280 }
                }
            ).setOrigin(0.5);

        });

        this.is_camera_moving = false;
    }

    walking_script() {
        let anim = null;

        if (this.keys.up.isDown) {

            if (this.registry.get('is_player_human')) {
                anim = 'upwalk';
            } else {
                anim = 'monster_upwalk';
            }
        }
        if (this.keys.down.isDown) {

            if (this.registry.get('is_player_human')) {
                anim = 'walk';
            } else {
                anim = 'monster_downwalk';
            }
        }
        if (this.keys.left.isDown) {

            if (this.registry.get('is_player_human')) {
                anim = 'leftwalk';
            } else {
                anim = 'monster_leftwalk';
            }
        }
        if (this.keys.right.isDown) {

            if (this.registry.get('is_player_human')) {
                anim = 'rightwalk';
            } else {
                anim = 'monster_rightwalk';
            }
        }

        if (anim) {
            if (this.player.anims.currentAnim?.key !== anim) {
                this.player.anims.play(anim);
            }
        } else {
            if (this.registry.get('is_player_human')) {
                this.player.anims.play('stand', true);
            } else {
                this.player.anims.play('monster_stand', true);
            }
        }

    }

    nextDialogueLine() {

        this.dialogueIndex++;

        if (this.dialogueIndex < this.guide_text_string.length) {

            this.guide_text.setText(
                this.guide_text_string[this.dialogueIndex]
            );

            if (this.dialogueIndex === 2 || this.dialogueIndex === 3 || this.dialogueIndex === 4) {
                this.guide_text.setFontSize(14);
            } else {
                this.guide_text.setFontSize(20);
            }

        } else {

            // Fine dialogo
            this.dialogueActive = false;

            this.registry.set('player_x', this.player.x);
            this.registry.set('player_y', this.player.y);

            this.scene.start('Scene4');
        }
    }






    after_tutorial_script() {

        // 1️⃣ Creazione UI camera sopra la main
        this.uiCamera = this.cameras.add(
            0,
            0,
            this.scale.width,
            this.scale.height
        );

        this.uiCamera.setScroll(0, 0);
        this.uiCamera.setZoom(1);

        // 2️⃣ UI ELEMENTS (prima li creiamo)
        this.dialogBox = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height - 60,
            this.scale.width - 40,
            40,
            0x000000
        ).setOrigin(0.5);

        this.dialogText = this.add.text(
            this.scale.width / 2,
            this.scale.height - 60,
            "esci dal castello",
            {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Courier, monospace',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center',
                wordWrap: { width: this.scale.width - 80 }
            }
        ).setOrigin(0.5);

        // 3️⃣ La MAIN camera NON deve vedere la UI
        this.cameras.main.ignore([
            this.dialogBox,
            this.dialogText
        ]);

        // 4️⃣ La UI camera deve ignorare TUTTO il mondo
        this.uiCamera.ignore([
            this.groundLayer,
            this.wallsLayer,
            this.player,
            this.npc1,
            this.uscita
        ]);
    }

    handleExit() {
        this.registry.set('player_x', this.player.x);
        this.registry.set('player_y', this.player.y);
        this.scene.start('Scene5');
    }

}