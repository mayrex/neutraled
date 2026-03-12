export default class Scene14 extends Phaser.Scene {
    constructor() {
        super('Scene14');


        this.ground_layer1 = null;
        this.walls_layer1 = null;
        this.nonbody_obj_layer1 = null;

        this.keys = null;
        this.enterKey = null;

        this.player = null;
        this.playerspeed = 120;
        this.is_camera_moving = true;

        this.event_triggered = false;
        this.dialogueActive = false;

        this.cartello_text_string = [
            'poi ci penso',
            'sto pensando',
            'vedo dopo con paolo',
            'sto pensando',
            'si lo so penso lentamente',
            'mi serve tempo',
            'ja non mettermi fretta',
            'pensa a giocare',
            'ooo ma chi li legge sti cosi',
            'stop'
        ]
        this.dialogueIndex = 0;

        let numb = 12;
        this.cartello_position_x = [
            16 * 11 - numb,
            16 * 17 - numb,
            16 * 24 - numb,
            16 * 31 - numb,
            16 * 39 - numb,
            16 * 45 - numb,
            16 * 53 - numb,
            16 * 61 - numb,
            16 * 69 - numb,
            16 * 78 - numb,
            16 * 83 - numb,
            16 * 88 - numb
        ];



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
        this.map5 = this.make.tilemap({ key: 'map5' });

        this.tileset5 = this.map5.addTilesetImage('spritefusion', 'tiles5');

        this.ground_layer1 = this.map5.createLayer('ground', this.tileset5, 0, 0);
        this.walls_layer1 = this.map5.createLayer('walls', this.tileset5, 0, 0);
        this.nonbody_obj_layer1 = this.map5.createLayer('nonbody_obj', this.tileset5, 0, 0);




        // ===== PLAYER =====
        const spawnX = 2 * 16 - 12;
        const spawnY = 18 * 16;

        this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
        this.physics.add.collider(this.player, this.walls_layer1);
        this.walls_layer1.setCollisionByExclusion([-1]);

        // CAMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(0, 0, 92 * 16, 22 * 16);

        // CAMERA UI

        this.dialogueBox = this.add.rectangle(
            400,
            520 / 2 + 150,
            600 / 2,
            80 / 2,
            0x000000
        ).setScrollFactor(0).setDepth(10).setVisible(false);

        this.dialogueText = this.add.text(
            400,
            520 / 2 + 150,
            "",
            {
                fontSize: "16px",
                color: "#ffffff",
                wordWrap: { width: 500 }
            }
        ).setScrollFactor(0).setDepth(11).setVisible(false).setOrigin(0.5);

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

        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_downwalking_frame1');
        }


    }

    update() {

        this.handleMovment();
        this.checkCartelli();
        this.handleDialogue();

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
            this.scene.start('Scene12');
        }

        if (this.player.x > 91 * 16) {
            this.scene.start('Scene15');
        }
    }

    checkCartelli() {

        // Non serve dialogActive per bloccare il player
        for (let i = 0; i < this.cartello_position_x.length; i++) {

            const cartelloX = this.cartello_position_x[i];
            const dist = Math.abs(this.player.x - cartelloX);

            if (dist < 10) {

                // Mostra la UI senza bloccare il player
                this.dialogueBox.setVisible(true);
                this.dialogueText.setVisible(true);
                this.dialogueText.setText(this.cartello_text_string[i]);

                return; // esci dal loop dopo il primo cartello vicino
            }
        }

        // Nascondi la UI se il player non è davanti a nessun cartello
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
    }


    handleDialogue() {

        if (!this.dialogueActive) return;

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {

            this.dialogueActive = false;
            this.is_camera_moving = true;

            this.dialogueBox.setVisible(false);
            this.dialogueText.setVisible(false);
        }
    }


}