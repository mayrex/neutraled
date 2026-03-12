export default class Scene5 extends Phaser.Scene {

    constructor() {
        super('Scene5');

        this.map1 = null;
        this.tileset1 = null;
        this.groundLayer1 = null;
        this.wallsLayer1 = null;

        this.player = null;
        this.keys = null;
        this.enterKey = null;

        this.playerspeed = 120;

        this.enemy1 = null;
        this.enemy1_x = 30 * 16;
        this.enemy1_y = 54 * 16;

        this.isEnemy1Defeated = null;

        this.enemy2 = null;
        this.enemy2_x = 16 * 35;
        this.enemy2_y = 16 * 32;

        this.isEnemy2Defeated = null;



        this.is_camera_moving = true;
        this.dialogueActive = false;
        this.dialogueIndex = 0;
        this.rect_for_textbox = null;
        this.guide_text = null;
        this.guide_text_string = ['vabbe poi ci penso 1', 'ja giuro che dopo ci penso 2', 'sto ancora pensando 3'];
        this.eventTriggered1 = false;
        this.eventTriggered2 = false;
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
        this.map1 = this.make.tilemap({ key: 'map1' });

        this.tileset1 = this.map1.addTilesetImage('spritefusion', 'tiles1');

        this.groundLayer1 = this.map1.createLayer('ground', this.tileset1, 0, 0);
        this.wallsLayer1 = this.map1.createLayer('walls', this.tileset1, 0, 0)


        // ===== PLAYER =====
        const spawnX = 14 * 16 - 12;
        const spawnY = 68 * 16;

        this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
        this.physics.add.collider(this.player, this.wallsLayer1);
        this.wallsLayer1.setCollisionByExclusion([-1]);



        // ===== NPC =======
        this.enemy1 = this.physics.add.staticSprite(this.enemy1_x, this.enemy1_y, 'enemy1').setScale(1.5);
        this.physics.add.collider(this.player, this.enemy1);



        this.enemy2 = this.physics.add.staticSprite(this.enemy2_x, this.enemy2_y - 30, 'enemy2').setScale(1.5);
        this.physics.add.collider(this.player, this.enemy2);



        // CAMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(0, 0, 56 * 16, 70 * 16);

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

        if (this.registry.get('enemy1_defeated')) {
            this.player.x = this.registry.get('scene5_player_x');
            this.player.y = this.registry.get('scene5_player_y');
        }

        if (this.registry.get('enemy2_defeated')) {
            this.player.x = this.registry.get('scene5_player_x');
            this.player.y = this.registry.get('scene5_player_y');
        }

        if (this.player_comeback) {
            this.player.x = this.registry.get('scene5_player_x');
            this.player.y = this.registry.get('scene5_player_y') + 30;
        }

        if (this.registry.get('enemy1_defeated')) {
            this.enemy1.destroy();
        } else {
            this.eventTriggered1 = false;
        }
        if (this.registry.get('enemy2_defeated')) {
            this.enemy2.destroy();
        } else {
            this.eventTriggered2 = false;
        }

        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_downwalking_frame1');
        }
    }

    update() {


        this.handleMovement();



        if (this.player.x > 16 * 25 && !this.eventTriggered1) {

            this.playerspeed = 0;
            this.eventTriggered1 = true;

            this.animation_script1();

            this.player.anims.play('stand');
        }



        if (this.player.x < 16 * 38 && this.player.y < 16 * 33 && !this.eventTriggered2) {

            this.playerspeed = 0;
            this.eventTriggered2 = true;

            this.animation_script2();

            this.player.anims.play('stand');
        }

        if (this.dialogueActive && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.nextDialogueLine();
        }



    }

    handleMovement() {
        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            0 + 12,
            70 * 16 - 12
        );

        this.player.setVelocity(0);

        let anim = null;

        if (this.keys.up.isDown && this.is_camera_moving) {
            this.player.setVelocityY(-this.playerspeed);
            anim = 'upwalk';
        }

        if (this.keys.down.isDown && this.is_camera_moving) {
            this.player.setVelocityY(this.playerspeed);
            anim = 'walk';
        }

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

        if (this.player.y > 16 * 70 - 14) {

            this.scene.start('Scene3');
        }
        if (this.player.y < 14) {
            this.registry.set('scene5_player_x', this.player.x);
            this.registry.set('scene5_player_y', this.player.y);
            this.player_comeback = true;
            this.scene.start('Scene8');
        }
    }


    animation_script1() {

        this.cameras.main.stopFollow();

        this.cameras.main.pan(
            this.enemy1.x,
            this.enemy1.y,
            1000,
            'Sine.easeInOut'
        );

        if (!this.is_camera_moving) return;

        this.time.delayedCall(1000, () => {

            this.dialogueActive = true;
            this.dialogueIndex = 0;

            this.rect_for_textbox = this.add.rectangle(
                this.enemy1_x,
                this.enemy1_y + 100,
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

    animation_script2() {

        this.cameras.main.stopFollow();

        this.cameras.main.pan(
            this.enemy2.x,
            this.enemy2.y,
            1000,
            'Sine.easeInOut'
        );

        if (!this.is_camera_moving) return;

        this.time.delayedCall(1000, () => {

            this.dialogueActive = true;
            this.dialogueIndex = 0;

            this.rect_for_textbox = this.add.rectangle(
                this.enemy2_x,
                this.enemy2_y + 90,
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

            this.playerspeed = 120;

            // this.cameras.main.startFollow(this.player);
            this.is_camera_moving = true;
            if (this.eventTriggered1) {
                this.scene.start('Scene6');
                this.registry.set('scene5_player_x', this.player.x);
                this.registry.set('scene5_player_y', this.player.y);
            }
            if (this.eventTriggered2) {
                this.scene.stop('Scene6');
                this.scene.start('Scene7');
                this.registry.set('scene5_player_x', this.player.x + 30);
                this.registry.set('scene5_player_y', this.player.y);
            }
        }
    }
}
