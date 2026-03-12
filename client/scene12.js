export default class Scene12 extends Phaser.Scene {
    constructor() {
        super('Scene12');

        this.ground_layer = null;
        this.walls_layer = null;
        this.nonbody_obj_layer = null;

        this.keys = null;
        this.enterKey = null;

        this.player = null;
        this.playerspeed = 120;
        this.is_camera_moving = true;

        this.event_triggered = false;
        this.dialogueActive = false;

        this.guide_text_string = [
            'poi ci penso',
            'sto pensando',
            'vedo dopo con paolo'
        ]
        this.dialogueIndex = 0;

        this.npc = null;
        this.npc_x = 35 * 16;
        this.npc_y = 17 * 16 + 1;


    }



    create() {

        //INPUT
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });

        this.enterKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );




        // ===== TILEMAP =====
        this.map4 = this.make.tilemap({ key: 'map4' });

        this.tileset4 = this.map4.addTilesetImage('spritefusion', 'tiles4');

        this.ground_layer = this.map4.createLayer('ground', this.tileset4, 0, 0);
        this.walls_layer = this.map4.createLayer('walls', this.tileset4, 0, 0);
        this.nonbody_obj_layer = this.map4.createLayer('nonbody_obj', this.tileset4, 0, 0);




        // ===== PLAYER =====
        const spawnX = 2 * 16 - 12;
        const spawnY = 18 * 16;

        this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
        this.physics.add.collider(this.player, this.walls_layer);
        this.walls_layer.setCollisionByExclusion([-1]);

        // npc 

        this.npc = this.physics.add.sprite(this.npc_x, this.npc_y + 2, 'enemy5_frame1').setFlipX(true);




        // CAMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(0, 0, 92 * 16, 22 * 16);

        // ===== ANIMAZIONI =====

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
            key: 'stand',
            frames: [{ key: 'player' }],
            frameRate: 6,
            repeat: -1
        });

        if (this.registry.get('scene13_npc_defeated')) {
            this.npc.destroy();
            this.player.x = this.registry.get('scene12_player_x');
            this.player.y = this.registry.get('scene12_player_y');
            this.event_triggered = true;
        } else {
            this.event_triggered = false;
        }

        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_downwalking_frame1');
        }
    }

    update() {

        this.handleMovment();

        if (this.dialogueActive && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.nextDialogueLine();
        }

        if (this.npc.x - this.player.x < 16 * 6 && !this.event_triggered) {
            this.animation_script();
            this.playerspeed = 0;
            this.event_triggered = true; // blocca chiamate successive
        }
    }

    handleMovment() {
        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            18 * 16 - 15,
            18 * 16 - 15,
        )



        this.player.setVelocity(0);

        let anim = null;

        if (this.keys.left.isDown && this.is_camera_moving) {
            this.player.setVelocityX(-this.playerspeed);
            anim = 'leftwalk';
        }

        if (this.keys.right.isDown && this.is_camera_moving) {
            this.player.setVelocityX(this.playerspeed);
            anim = 'rightwalk';
        }


        if (!this.registry.get('is_player_human')) {
            anim = 'monster_' + anim;
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

        if (this.player.x < 8) {
            this.scene.start('Scene10');
        }

        if (this.player.x > 16 * 91) {
            this.scene.start('Scene14');
        }
    }

    animation_script() {

        this.cameras.main.stopFollow();

        this.cameras.main.pan(
            this.npc.x,
            this.npc.y,
            1000,
            'Sine.easeInOut'
        );

        if (!this.is_camera_moving) return;

        this.time.delayedCall(1000, () => {

            this.dialogueActive = true;
            this.dialogueIndex = 0;

            this.rect_for_textbox = this.add.rectangle(
                this.npc_x,
                this.npc_y + 50,
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
                    align: 'center',
                    wordWrap: { width: 280 }
                }
            ).setOrigin(0.5);

        });

        this.is_camera_moving = false;
    }

    nextDialogueLine() {

        this.dialogueIndex++;

        if (this.dialogueIndex < this.guide_text_string.length) {

            this.guide_text.setText(
                this.guide_text_string[this.dialogueIndex]
            );

        } else {

            this.dialogueActive = false;

            this.rect_for_textbox.destroy();
            this.guide_text.destroy();

            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
            this.playerspeed = 120;
            this.is_camera_moving = true;

            this.registry.set('scene12_player_x', this.player.x);
            this.registry.set('scene12_player_y', this.player.y);

            this.scene.start('Scene13');



        }
    }
}