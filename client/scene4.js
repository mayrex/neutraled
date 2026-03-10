export default class Scene4 extends Phaser.Scene {
    constructor() {
        super('Scene4');

        this.battle_box_rect_border = null;
        this.player_sprite = null;
        this.player_shield = null;
        this.guide_sprite = null;
        this.bullet1 = null;
        this.bullet2 = null;
        this.bullet3 = null;
        this.bullet4 = null;
        this.battle_box_rect_width = 250;
        this.battle_box_rect_height = 250;
        this.player_speed = 4;
        this.keys = null;

        this.player_sprite_x = 400;
        this.player_sprite_y = 500;

        this.guide_sprite_x = 400;
        this.guide_sprite_y = 100;

        this.isBulletSpawned = false;

        this.bullet1_x = 300;
        this.bullet1_y = 50;

        this.bullet2_x = 200;
        this.bullet2_y = 50;

        this.bullet3_x = 500;
        this.bullet3_y = 50;

        this.bullet4_x = 600;
        this.bullet4_y = 50;

        this.bullets_speed = 50;


        this.guide_text = null;
        this.guide_text_x = 400;
        this.guide_text_y = 300;
        this.guide_text_string = [
            "corri verso i proiettili per pararli",
            "se non li pari ti faranno del danno"
        ];


        this.hp_bar_green = null;
        this.hp_bar_red = null;
        this.hp = 20;
        this.hp_bar_x = 200;
        this.hp_bar_y = 550;




    }


    create() {


        this.attacs_script();




        // input
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            interact: 'ENTER'
        });

        this.battle_box_rect_border = this.add.rectangle(
            400,
            300,
            this.battle_box_rect_width,
            this.battle_box_rect_height,
            0x000000).setOrigin(0.5).setStrokeStyle(
                5,
                0xffffff
            );

        this.player_shield = this.physics.add.sprite(
            400,
            300,
            'player_shield'
        ).setScale(1.5).setDepth(2);


        this.guide_sprite = this.add.sprite(
            this.guide_sprite_x,
            this.guide_sprite_y,
            'npc'
        ).setOrigin(0.5).setScale(3);

        this.player_sprite = this.physics.add.sprite(
            this.player_sprite_x,
            this.player_sprite_y,
            'player'
        ).setOrigin(0.5).setScale(3);


        this.guide_text = this.add.text(
            this.guide_text_x,
            this.guide_text_y,
            this.guide_text_string[0], {
            fontSize: '30px',         // dimensione iniziale
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 250 } // padding interno
        }
        ).setOrigin(0.5);

        this.hp_bar_green = this.add.rectangle(
            this.hp_bar_x,
            this.hp_bar_y,
            20 * this.hp,
            30,
            0x00ff00
        ).setDepth(2).setOrigin(0);

        this.hp_bar_red = this.add.rectangle(
            this.hp_bar_x,
            this.hp_bar_y,
            20 * this.hp,
            30,
            0xff0000
        ).setDepth(1).setOrigin(0);


    }

    update() {

        if (this.isBulletSpawned) {
            this.battle_end_script();
        }



        if (this.keys.up.isDown) {
            this.player_shield.y -= this.player_speed;
        }

        if (this.keys.down.isDown) {
            this.player_shield.y += this.player_speed;
        }

        if (this.keys.left.isDown) {
            this.player_shield.x -= this.player_speed;
        }

        if (this.keys.right.isDown) {
            this.player_shield.x += this.player_speed;
        }


        this.player_shield.x = Phaser.Math.Clamp(
            this.player_shield.x,
            this.battle_box_rect_border.x - this.battle_box_rect_width / 2 + 12,
            this.battle_box_rect_border.x + this.battle_box_rect_width / 2 - 12
        )

        this.player_shield.y = Phaser.Math.Clamp(
            this.player_shield.y,
            this.battle_box_rect_border.y - this.battle_box_rect_height / 2 + 12,
            this.battle_box_rect_border.y + this.battle_box_rect_height / 2 - 12
        )

        if (this.isBulletSpawned) {
            this.time.delayedCall(4000, () => {


                if (this.bullet1 && this.bullet1.active) {
                    this.physics.moveToObject(this.bullet1, this.player_sprite, this.bullets_speed);
                }
                if (this.bullet2 && this.bullet2.active) {
                    this.physics.moveToObject(this.bullet2, this.player_sprite, this.bullets_speed);
                }
                if (this.bullet3 && this.bullet3.active) {
                    this.physics.moveToObject(this.bullet3, this.player_sprite, this.bullets_speed);
                }
                if (this.bullet4 && this.bullet4.active) {
                    this.physics.moveToObject(this.bullet4, this.player_sprite, this.bullets_speed);
                }

            });
        };



    }

    attacs_script() {

        if (!this.isBulletSpawned) {

            this.time.delayedCall(3000, () => {
                this.bullet1 = this.physics.add.sprite(

                    this.bullet1_x,
                    this.bullet1_y,
                    'bullet1'
                );

                this.bullet2 = this.physics.add.sprite(

                    this.bullet2_x,
                    this.bullet2_y,
                    'bullet1'
                );

                this.bullet3 = this.physics.add.sprite(

                    this.bullet3_x,
                    this.bullet3_y,
                    'bullet1'
                );

                this.bullet4 = this.physics.add.sprite(

                    this.bullet4_x,
                    this.bullet4_y,
                    'bullet1'
                );
                this.physics.add.overlap(this.bullet1, this.player_shield, () => {
                    this.bullet1.destroy();


                });

                this.physics.add.overlap(this.bullet2, this.player_shield, () => {
                    this.bullet2.destroy();


                });

                this.physics.add.overlap(this.bullet3, this.player_shield, () => {
                    this.bullet3.destroy();


                });

                this.physics.add.overlap(this.bullet4, this.player_shield, () => {
                    this.bullet4.destroy();


                });

                this.physics.add.overlap(this.bullet1, this.player_sprite, () => {
                    this.bullet1.destroy();
                    this.guide_text.setText(this.guide_text_string[1]);
                    this.hp -= 2;
                    this.hp_bar_green.setSize(20 * this.hp, 30);


                });

                this.physics.add.overlap(this.bullet2, this.player_sprite, () => {
                    this.bullet2.destroy();
                    this.guide_text.setText(this.guide_text_string[1]);
                    this.hp -= 2;
                    this.hp_bar_green.setSize(20 * this.hp, 30);


                });

                this.physics.add.overlap(this.bullet3, this.player_sprite, () => {
                    this.bullet3.destroy();
                    this.guide_text.setText(this.guide_text_string[1]);
                    this.hp -= 2;
                    this.hp_bar_green.setSize(20 * this.hp, 30);


                });

                this.physics.add.overlap(this.bullet4, this.player_sprite, () => {
                    this.bullet4.destroy();
                    this.guide_text.setText(this.guide_text_string[1]);
                    this.hp -= 2;
                    this.hp_bar_green.setSize(20 * this.hp, 30);


                });
                this.isBulletSpawned = true;


            });

        }
    }

    battle_end_script() {
        if (
            (!this.bullet1 || !this.bullet1.active) &&
            (!this.bullet2 || !this.bullet2.active) &&
            (!this.bullet3 || !this.bullet3.active) &&
            (!this.bullet4 || !this.bullet4.active)
        ) {
            this.time.delayedCall(1000, () => {
                this.guide_text.setText('complimenti hai completato il tutorial!\nora esci dal castello e neutralizza quei mostri!');
                this.time.delayedCall(7000, () => {

                    this.scene.start('Scene3');
                    this.registry.set('tutorial_done', true);
                })

            });
        }
    }

}