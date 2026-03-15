export default class Scene10 extends Phaser.Scene {
    constructor() {
        super('Scene10');

        this.enterKey = null;
        this.map3 = null;
        this.tileset3 = null;
        this.groundLayer3 = null;
        this.wallsLayer3 = null;
        this.nonbody_obj_layer1 = null;
        this.player = null;
        this.playerspeed = 120;
        this.is_camera_moving = true;

        this.npc = null;
        this.npc_x = 45 * 16;
        this.npc_y = 18 * 16 - 12;


        this.event_triggered = false;
        this.dialogueActive = false;

        this.guide_text_string = [
            'Non avresti mai dovuto varcare questo confine.',
            'Gli umani hanno portato solo distruzione.',
            'Ora ne pagherai il prezzo, preparati a combattere!'
        ]
        this.dialogueIndex = 0;




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
        this.map3 = this.make.tilemap({ key: 'map3' });

        this.tileset3 = this.map3.addTilesetImage('spritefusion', 'tiles3');

        this.groundLayer3 = this.map3.createLayer('ground', this.tileset3, 0, 0);
        this.wallsLayer3 = this.map3.createLayer('walls', this.tileset3, 0, 0);
        this.nonbody_obj_layer1 = this.map3.createLayer('nonbody_obj', this.tileset3, 0, 0);

        // ===== PLAYER =====
        const spawnX = 18 * 16 - 12;
        const spawnY = 21 * 16;

        this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
        this.physics.add.collider(this.player, this.wallsLayer3);
        this.wallsLayer3.setCollisionByExclusion([-1])

        if (this.registry.get('returning_from_scene12')) {
            this.player.x = (this.registry.get('scene10_exit_x') || (111 * 16)) - 30;
            this.registry.set('returning_from_scene12', false);
        }


        // NPC

        this.npc = this.physics.add.staticSprite(this.npc_x, this.npc_y, 'enemy4').setFlipX(true);




        // CAMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(0, 0, 111 * 16, 22 * 16);




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

        if (!this.anims.exists('enemy4_idle')) this.anims.create({
            key: 'enemy4_idle',
            frames: this.anims.generateFrameNumbers('enemy4', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });

        if (this.registry.get('scene11_npc_defeated')) {
            this.npc.destroy();
            this.event_triggered = true;
            this.player.x = this.registry.get('scene10_player_x');
            this.player.y = this.registry.get('scene10_player_y');
        } else {
            this.event_triggered = false;
            if (this.npc.active) {
                this.npc.play('enemy4_idle');
            }
        }

        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_downwalking_frame1');
        }
    }

    update() {


        this.handleMovement();
        if (this.dialogueActive && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.nextDialogueLine();
        }

        if (this.player.x > 16 * 40 && !this.event_triggered) {
            this.animation_script();
            this.playerspeed = 0;
            this.event_triggered = true; // blocca chiamate successive
        }

        if (this.player.x > 111 * 16) {
            this.registry.set('scene10_exit_x', this.player.x);
            this.scene.start('Scene12');
        }
    }


    handleMovement() {


        if (this.player.x < 16 * 19) {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                18 * 16 - 15,
                22 * 16,
            )
            // Fix 11: Allowance to go back to scene 8
            if (this.player.x < 8) {
                this.scene.start('Scene8');
            }
        } else {
            this.player.y = Phaser.Math.Clamp(
                this.player.y,
                18 * 16 - 15,
                18 * 16 - 15,
            )

        }




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
            if (anim === 'walk') {
                anim = 'monster_downwalk';
            } else if (anim !== null) {
                anim = 'monster_' + anim;
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

            this.player.x = this.registry.set('scene10_player_x', this.player.x);
            this.player.y = this.registry.set('scene10_player_y', this.player.y);

            this.scene.start('Scene11');



        }
    }
}

