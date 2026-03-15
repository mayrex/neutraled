export default class Scene8 extends Phaser.Scene {
    constructor() {
        super('Scene8');

        this.map2 = null;
        this.tileset2 = null;
        this.groundLayer2 = null;
        this.wallsLayer2 = null;
        this.nonbody_obj_layer = null;
        this.body_obj_layer = null;

        this.player = null;
        this.playerspeed = 120;
        this.keys = null;
        this.enterKey = null;

        this.is_camera_moving = true;

        this.npc1 = null;
        this.npc1_x = 18 * 16 - 12;
        this.npc1_y = 62 * 16;

        this.npc2 = null;
        this.npc2_x = 18 * 16 - 12;
        this.npc2_y = 20 * 16;

        this.eventTriggered1 = false;

        this.eventTriggered2 = false;

        this.dialogueActive = false;
        this.dialogueActive1 = false;

        this.rect_for_textbox = null;
        this.guide_text = null;

        this.guide_text_string = [
            "L'Oscurità si avvicina.",
            "Solo chi possiede il vero potere può proseguire.",
            "Mostrami cosa sai fare!"
        ];

        this.guide_text_string1 = [
            "da qui possono proseguire solo i mostri.",
            "l'unico modo per sconfiggere chi ti si porrà davanti è quello di diventare un mostro.",
            "solo così potrai sconfiggere tifone",
            'lascia che ti trasformi in un mostro e combatti per gli umani',
            'non tememre,trilly ti aspetta...',
            'ah un ultima cosa',
            'da ora in poi dovrai anche attaccare',
            'è ovvio che lo sai fare',
            '(usa invio per attaccare i mostri mentre li combatti)'
        ];

        this.player_is_human = true;



    }



    create() {


        if (!this.scene.isActive('SceneUI')) {
            this.scene.launch('SceneUI');
        }
        this.scene.bringToTop('SceneUI');




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
        this.map2 = this.make.tilemap({ key: 'map2' });

        this.tileset2 = this.map2.addTilesetImage('spritefusion', 'tiles2');

        this.groundLayer2 = this.map2.createLayer('ground', this.tileset2, 0, 0);
        this.wallsLayer2 = this.map2.createLayer('walls', this.tileset2, 0, 0);
        this.body_obj_layer = this.map2.createLayer('body_obj', this.tileset2, 0, 0);
        this.nonbody_obj_layer = this.map2.createLayer('nonbody_obj', this.tileset2, 0, 0);

        // ===== PLAYER =====
        const spawnX = 18 * 16 - 12;
        const spawnY = 76 * 16;

        this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
        this.physics.add.collider(this.player, this.wallsLayer2);
        this.wallsLayer2.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, this.body_obj_layer);
        this.body_obj_layer.setCollisionByExclusion([-1]);


        // ===== NPC ===== //
        this.npc1 = this.physics.add.staticSprite(this.npc1_x, this.npc1_y, 'enemy3_frame1').setScale(3);
        this.npc1.body.setSize(20, 20); // Make hitbox smaller (Fix 9)
        this.physics.add.collider(this.player, this.npc1);


        this.npc2 = this.physics.add.staticSprite(this.npc2_x, this.npc2_y, 'npc1').setScale(1);
        this.npc2.body.setSize(20, 20); // Make hitbox smaller (Fix 9)
        this.physics.add.collider(this.player, this.npc2)





        // CAMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(0, 0, 35 * 16, 78 * 16);

        // ====== UI ======

        this.dialogueBox = this.add.rectangle(400, 520, 700, 120, 0x000000)
            .setScrollFactor(0)
            .setVisible(false);

        this.dialogueText = this.add.text(120, 480, "", {
            fontSize: "18px",
            fill: "#ffffff",
            wordWrap: { width: 560 }
        }).setScrollFactor(0).setVisible(false);

        // ===== ANIMAZIONI =====

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

        if (!this.anims.exists('stand')) this.anims.create({
            key: 'stand',
            frames: [{ key: 'player' }],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_player_stand')) this.anims.create({
            key: 'monster_player_stand',
            frames: [{
                key: 'monster_player_stand_frame'
            }],
            framerate: 6,
            repeat: -1
        });

        if (this.registry.get('enemy3_defeated')) {
            this.npc1.destroy();
            this.player.x = this.registry.get('scene8_player_x');
            this.player.y = this.registry.get('scene8_player_y');
        } else {
            this.eventTriggered1 = false;
        }

        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_downwalking_frame1');
        }
    }

    update() {

        this.handleMovement();


        if (this.player.y < this.npc1.y + 16 * 4 && !this.eventTriggered1) {

            this.playerspeed = 0;
            this.eventTriggered1 = true;

            this.animation_script1();

            if (this.registry.get('is_player_humn')) {
                this.player.anims.play('stand');
            } else {
                this.player.anims.play('monster_stand');
            }
        }

        if (this.player.y < this.npc2.y + 16 * 4 && !this.eventTriggered2) {
            this.playerspeed = 0;
            this.eventTriggered2 = true;
            this.animation_script2();
            if (this.registry.get('is_player_humn')) {
                this.player.anims.play('stand');
            } else {
                this.player.anims.play('monster_stand');
            }

        }

        if (this.dialogueActive && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.nextDialogueLine();
        }

        if (this.dialogueActive1 && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.nextDialogueLine1();
        }
    }

    handleMovement() {
        // this.player.y = Phaser.Math.Clamp(
        //     this.player.y,
        //     0 + 12,
        //     70 * 16 - 12
        // );

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


        // torna alla scena precedente
        if (this.player.y > 16 * 76) {

            this.registry.set('scene8_player_x', this.player.x);
            this.registry.set('scene8_player_y', this.player.y);

            this.scene.start('Scene5');
        }

        // passa alla scena successiva
        if (this.player.y < 16 * 2) {

            this.registry.set('scene8_player_x', this.player.x);
            this.registry.set('scene8_player_y', this.player.y);

            this.scene.start('Scene10');
        }



    }


    animation_script1() {

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

    animation_script2() {

        this.cameras.main.stopFollow();

        this.cameras.main.pan(
            this.npc2.x,
            this.npc2.y,
            1000,
            'Sine.easeInOut'
        );

        if (!this.is_camera_moving) return;

        this.time.delayedCall(1000, () => {

            this.dialogueActive1 = true;
            this.dialogueIndex = 0;

            this.rect_for_textbox = this.add.rectangle(
                this.npc2_x,
                this.npc2_y + 100,
                300,
                50,
                0x000000
            ).setOrigin(0.5).setStrokeStyle(2, 0xffffff);

            this.guide_text = this.add.text(
                this.rect_for_textbox.x,
                this.rect_for_textbox.y,
                this.guide_text_string1[this.dialogueIndex],
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

            if (this.eventTriggered1 && !this.eventTriggered2) {
                this.registry.set('scene8_player_x', this.player.x);
                this.registry.set('scene8_player_y', this.player.y);
                this.scene.start("Scene9");
            }
            if (this.eventTriggered2) {
                this.player_is_human = false;
            }

        }
    }

    nextDialogueLine1() {

        this.dialogueIndex++;

        if (this.dialogueIndex < this.guide_text_string1.length) {

            this.guide_text.setText(
                this.guide_text_string1[this.dialogueIndex]
            );

        } else {

            this.dialogueActive1 = false;

            this.rect_for_textbox.destroy();
            this.guide_text.destroy();

            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
            this.playerspeed = 120;
            this.is_camera_moving = true;

            if (this.eventTriggered1 && !this.eventTriggered2) {
                this.scene.start("Scene9");
            }
            if (this.eventTriggered2) {
                this.player_is_human = false;
                this.registry.set('is_player_human', false);
            }

        }

    }
}
