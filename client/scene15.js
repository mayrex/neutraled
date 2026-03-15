export default class Scene15 extends Phaser.Scene {
    constructor() {
        super('Scene15');

        // inputs
        this.keys = null;
        this.enterKey = null;

        // variabili del player 
        this.player = null;
        this.player_x = 400;
        this.player_y = 500;
        this.playerspeed = 160;
        this.can_player_move = false;
        this.player_attacks = null;
        this.is_camera_moving = null;
        this.player_firerate = 400;// in ms

        // variabili di tifone
        this.tifone = null;
        this.tifone_x = 400;
        this.tifone_y = 1000;
        this.tifone_fireball_attacks = null;// attacchi di tifone
        this.tifone_wind_attacks = null;// attacchi di tifone
        this.tifone_wave_attack = null;// attacchi di tifone
        this.tifone_wave2_attack = null;// attacchi di tifone
        this.tifone_lighting_attack = null;// attacchi di tifone
        this.tifone_laser_attack = null;// attacchi di tifone
        this.tifone_lateral_wave_attack = null;// attacchi di tifone
        this.tifone_falling_clouds_attack = null;// attacchi di tifone

        this.tifone_hitbox_width = 40;
        this.tifone_hitbox_height = 40;


        // variabili della logica di gioco
        this.current_phase = 100; // è la fase di gioco (100 = pausa )
        this.player_hp = 100;
        this.tifone_hp = 100;
        this.player_damage = 1;
        this.tifone_damage = 5;
        this.phase0_tifone_attackrate = 300;//ms
        this.phase1_tifone_attackrate = 400;// ms
        this.phase2_tifone_attackrate = 4000 // ms
        this.phase3_tifone_attackrate = this.phase2_tifone_attackrate * 2// in ms
        this.phase4_tifone_attackrate = 250; //ms
        this.phase5_tifone_attackrate = 2000; //ms
        this.phase6_tifone_attackrate = 700; //ms
        this.nextPlayerShot = 0;




        // variabili delle animazioni e oggetti annessi
        this.is_starting_animation_active = true;
        this.is_ending_animation_active = false;
        this.is_tifone_upgoing = false;
        this.start_animation_text_obj = null;
        this.start_animation_text_x = 400;
        this.start_animation_text_y = 300;
        this.start_animation_text = [
            'sei finalmente giunto alla fine del tuo viaggio',
            'ti aspetta solo un\'ultima sfida',
            'ma questa volta non sarà così facile...',
            'buona fortuna...'
        ];
        this.start_animation_text_index = 0;
        this.start_animation_text_index_max = 3;
        this.start_animation_text_speed = 1000; // in millisecondi

        this.black_rect = null;
        this.black_rect_start_x = 400;
        this.black_rect_start_y = 300;
        this.is_rect_falling = false;
        this.start_rect_width = 800;
        this.start_rect_height = 600;




        // cielo e annessi
        this.background = null;
        this.sky = null;
        this.clouds = null;

        // personaggio segreto
        this.secret_character = null;
        this.secret_character_x = null;
        this.secret_character_y = null;

        this.player_hp_green_bar = null;
        this.player_hp_red_bar = null;
        this.tifone_hp_green_bar = null;
        this.tifone_hp_red_bar = null;
        this.tifone_hp_bar_x = null;
        this.tifone_hp_bar_y = null;
        this.player_hp_max = 10;
        this.player_hp = 10;
        this.tifone_hp_max = 100;
        this.tifone_hp = 100;

        //
        this.trilly = null;








    }

    // questa è la scena 15,l'ultima di questa avventura,qui il player affronta il boss finale,il re dei mostri Tifone,
    // Perché Tifone?
    // È figlio di Gea e Tartaro, descritto come un gigantesco mostro con cento teste serpentine e ali, capace di lanciare fiamme e vorticare tempeste.
    // Il mito lo descrive come la più grande minaccia per gli dei stessi, tanto che Zeus dovette combatterlo in una battaglia catastrofica.
    // La sua forza e capacità distruttiva erano tali da rappresentare il caos primordiale incarnato, un nemico quasi invincibile.
    // tutte le piu grandi storie si ispirano o alla mitologia o alla religione e anche questa lo fa,qui il player combatte come ha fatto zeus,
    // peccato per lui che puo solo schivare i suoi enormi attacchi e sparare i suoi miseri colpi che fanno solo 1 di danno mentre lui ha 200 hp




    create() {


        if (!this.scene.isActive('SceneUI')) {
            this.scene.launch('SceneUI');
        }
        this.scene.bringToTop('SceneUI');




        this.sound.stopAll();
        this.sound.play('scene15_audio', { loop: true });

        const livello_di_profondita_max = 10;

        const pLevel = this.registry.get('player_level') || 1;
        this.base_max_hp = 10;
        this.max_hp = this.base_max_hp * pLevel;
        this.player_hp = this.max_hp;
        this.tifone_hp = this.tifone_hp_max;



        // sfondo
        this.background = this.add.image(400, 300, 'background').setOrigin(0.5).setScale(3.15).setDepth(livello_di_profondita_max - 5);
        this.sky = this.add.image(400, 300, 'sky').setOrigin(0.5).setScale(1.6).setDepth(livello_di_profondita_max - 6);

        // player

        this.player = this.physics.add.sprite(this.player_x, this.player_y, 'player').setDepth(livello_di_profondita_max - 3);
        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_stand_frame');
        }

        // attacchi del player

        this.player_attacks = this.physics.add.group();



        // tifone

        this.tifone = this.physics.add.sprite(this.tifone_x, this.tifone_y, 'tifone_frame1').setDepth(livello_di_profondita_max - 5.5).setOrigin(0.5).setScale(2).setSize(this.tifone_hitbox_width, this.tifone_hitbox_height);


        this.physics.add.overlap(
            this.tifone,
            this.player_attacks,
            (attack, npc) => {
                npc.destroy();
                this.tifone_hp -= this.player_damage;

            },
            null,
            this
        );



        //

        const playerBarMaxWidth = this.player.width + 15;
        this.player_hp_red_bar = this.add.rectangle(
            this.player.x - playerBarMaxWidth / 2,
            this.player.y - 20,
            playerBarMaxWidth,
            5,
            0xff0000
        ).setDepth(10 - 2).setOrigin(0, 0.5).setVisible(false);

        this.player_hp_green_bar = this.add.rectangle(
            this.player.x - playerBarMaxWidth / 2,
            this.player.y - 20,
            playerBarMaxWidth,
            5,
            0x00ff00
        ).setDepth(10 - 2).setOrigin(0, 0.5).setVisible(false);

        this.tifone_hp_red_bar = this.add.rectangle(
            this.tifone.x - 100, // 200 hp * 2 width = 400 total. Wait, max hp is 100 for tifone, but 200 health text. Let's make it shift by 100.
            this.tifone.y,
            200,
            30,
            0xff0000
        ).setDepth(10 - 2).setOrigin(0, 0.5).setVisible(false);


        this.tifone_hp_green_bar = this.add.rectangle(
            this.tifone.x - 100,
            this.tifone.y,
            200,
            30,
            0x00ff00
        ).setDepth(10 - 2).setOrigin(0, 0.5).setVisible(false);






        // attacchi di tifone


        this.tifone_fireball_attacks = this.physics.add.group();
        this.tifone_wind_attacks = this.physics.add.group();
        this.tifone_wave_attack = this.physics.add.group();
        this.tifone_wave2_attack = this.physics.add.group();
        this.tifone_lighting_attack = this.physics.add.group();
        this.tifone_laser_attack = this.physics.add.group();
        this.tifone_lateral_wave_attack = this.physics.add.group();
        this.tifone_falling_clouds_attack = this.physics.add.group();


        this.physics.add.overlap(
            this.player,
            this.tifone_fireball_attacks,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.tifone_wind_attacks,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.tifone_wave_attack,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.tifone_wave2_attack,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.tifone_lighting_attack,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        ); this.physics.add.overlap(
            this.player,
            this.tifone_laser_attack,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.tifone_lateral_wave_attack,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.tifone_falling_clouds_attack,
            (attack, npc) => {
                npc.destroy();
                this.player_hp -= (1 * (this.registry.get('player_level') || 1));
            },
            null,
            this
        );



        // rect e animazione di inizio


        this.black_rect = this.add.rectangle(
            this.black_rect_start_x
            , this.black_rect_start_y,
            this.start_rect_width,
            this.start_rect_height,
            0x000000
        ).setOrigin(0.5).setDepth(livello_di_profondita_max - 1);

        this.start_animation_text_obj = this.add.text(
            this.start_animation_text_x,
            this.start_animation_text_y,
            'auraaaaa'
        ).setOrigin(0.5).setDepth(livello_di_profondita_max - 1);







        // animazione d'inizio
        this.start_animation();


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

        if (!this.anims.exists('monster_upwalk')) this.anims.create({
            key: 'monster_upwalk',
            frames: [
                { key: 'monster_player_upwalking_frame1' },
                { key: 'monster_player_upwalking_frame2' },
                { key: 'monster_player_upwalking_frame1' },
                { key: 'monster_player_upwalking_frame3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_leftwalk')) this.anims.create({
            key: 'monster_leftwalk',
            frames: [
                { key: 'monster_player_left_frame1' },
                { key: 'monster_player_left_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_rightwalk')) this.anims.create({
            key: 'monster_rightwalk',
            frames: [
                { key: 'monster_player_right_frame1' },
                { key: 'monster_player_right_frame2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_walk')) this.anims.create({
            key: 'monster_walk',
            frames: [
                { key: 'monster_player_downwalking_frame1' },
                { key: 'monster_player_downwalking_frame2' },
                { key: 'monster_player_downwalking_frame3' }
            ],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('monster_stand')) this.anims.create({
            key: 'monster_stand',
            frames: [{ key: 'monster_player_stand_frame' }],
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('tornado_anim')) this.anims.create({
            key: 'tornado_anim',
            frames: this.anims.generateFrameNumbers('tifone_tornado', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });

        if (!this.anims.exists('onde_laterali_anim')) this.anims.create({
            key: 'onde_laterali_anim',
            frames: this.anims.generateFrameNumbers('tifone_onde_laterali_frame1', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {

        this.handlelose();

        this.handleBattlePhase();
        this.handleMovment();

        if (this.is_rect_falling) {
            this.falling_start_animation();
        };

        if (this.is_tifone_upgoing) {
            this.tifone_upgoing_animation();
        };

        if (this.tifone_hp <= 0) {
            this.is_ending_animation_active = true;
        }

        if (this.is_ending_animation_active) {
            this.is_ending_animation();
        }
        this.handle_player_attacks();
        this.handle_hp_bars();




    }

    handleMovment() {

        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            0 + 12,
            800 - 12
        );

        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            600 - 100,
            600 - 16
        )

        if (!this.can_player_move) {
            this.playerspeed = 0;
        } else {
            this.playerspeed = 120
        }

        this.player.setVelocity(0);

        let anim = null;

        if (this.keys.up.isDown && this.can_player_move) {
            this.player.setVelocityY(-this.playerspeed);
            anim = 'upwalk';
        }

        if (this.keys.down.isDown && this.can_player_move) {
            this.player.setVelocityY(this.playerspeed);
            anim = 'walk';
        }

        if (this.keys.left.isDown && this.can_player_move) {
            this.player.setVelocityX(-this.playerspeed);
            anim = 'leftwalk';
        }

        if (this.keys.right.isDown && this.can_player_move) {
            this.player.setVelocityX(this.playerspeed);
            anim = 'rightwalk';
        }


        if (!this.registry.get('is_player_human') && anim) {
            anim = 'monster_' + anim;
        }

        if (anim) {
            if (this.player.anims.currentAnim?.key !== anim) {
                this.player.anims.play(anim);
            }
        } else {
            if (!this.registry.get('is_player_human')) {
                this.player.anims.play('monster_stand', true);
            } else {
                this.player.anims.play('stand', true);
            }
        }
    }

    start_animation() {

        this.time.addEvent({
            delay: this.start_animation_text_speed,
            callback: () => {

                if (this.start_animation_text_index <= this.start_animation_text_index_max) {
                    this.start_animation_text_obj.setText(this.start_animation_text[this.start_animation_text_index++]);
                    this.start_animation();

                } else {
                    this.is_rect_falling = true;
                }
            },
            loop: false
        });
    }

    falling_start_animation() {
        const falling_speed = 10
        if (this.is_rect_falling) {
            this.black_rect.y += falling_speed;
            this.start_animation_text_obj.y += falling_speed;
        }

        if (this.black_rect.y > this.black_rect_start_y + this.start_rect_height) {
            this.is_rect_falling = false;
            this.black_rect.destroy();
            this.start_animation_text_obj.destroy();
            this.is_starting_animation_active = false;
            this.is_tifone_upgoing = true;
        }
    }

    tifone_upgoing_animation() {

        const tifonespeed = 3
        if (this.tifone.y > 300) {
            this.cameras.main.shake(100, 0.03);
            this.tifone.y -= tifonespeed;
        } else {
            this.is_tifone_upgoing = false;
            this.can_player_move = true;
            this.current_phase = 0;
            this.player_hp_red_bar.setVisible(true);
            this.player_hp_green_bar.setVisible(true);
            this.tifone_hp_red_bar.setVisible(true);
            this.tifone_hp_green_bar.setVisible(true);
        }


    }

    handleBattlePhase() {

        switch (this.current_phase) {

            case 0:
                this.handlePhase0();
                break;
            case 1:
                this.handlePhase1();
                break;

            case 2:
                this.handlePhase2();

                break;
            case 3:
                this.handlePhase3();

                break;
            case 4:
                this.handlePhase4();
                break;
            case 5:
                this.handlePhase5();
                break;
            case 6:
                this.handlePhase6();
                break;
            case 7:
                this.handlePhase7();
                break;
            case 100:
                this.update_phase0_attacks();
                this.update_phase1_attacks();
                this.update_phase2_attacks();
                this.update_phase3_attacks();
                this.update_phase4_attacks();
                this.update_phase5_attacks();
                this.update_phase6_attacks();
                break;
        }
    }

    handlePhase0() {
        this.current_phase = 100;
        this.time.addEvent({
            delay: this.phase0_tifone_attackrate,
            callback: () => {
                let x = 100;
                let y = 400;
                let delta_x = 100;

                const fireball = this.tifone_fireball_attacks.create(x, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                this.time.addEvent({
                    delay: this.phase0_tifone_attackrate,
                    callback: () => {
                        const fireball = this.tifone_fireball_attacks.create(x + delta_x, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                        this.time.addEvent({
                            delay: this.phase0_tifone_attackrate,
                            callback: () => {
                                const fireball = this.tifone_fireball_attacks.create(x + 2 * delta_x, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                this.time.addEvent({
                                    delay: this.phase0_tifone_attackrate,
                                    callback: () => {
                                        const fireball = this.tifone_fireball_attacks.create(x + 3 * delta_x, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                        this.time.addEvent({
                                            delay: this.phase0_tifone_attackrate,
                                            callback: () => {
                                                const fireball = this.tifone_fireball_attacks.create(x + 4 * delta_x, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                this.time.addEvent({
                                                    delay: this.phase0_tifone_attackrate,
                                                    callback: () => {
                                                        const fireball = this.tifone_fireball_attacks.create(x + 5 * delta_x, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                        this.time.addEvent({
                                                            delay: this.phase0_tifone_attackrate,
                                                            callback: () => {
                                                                const fireball = this.tifone_fireball_attacks.create(x + 6 * delta_x, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                this.time.addEvent({
                                                                    delay: this.phase0_tifone_attackrate + 4500,
                                                                    callback: () => {
                                                                        const fireball = this.tifone_fireball_attacks.create(x + 6 * delta_x + 50, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                        this.time.addEvent({
                                                                            delay: this.phase0_tifone_attackrate,
                                                                            callback: () => {
                                                                                const fireball = this.tifone_fireball_attacks.create(x + 5 * delta_x + 50, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                                this.time.addEvent({
                                                                                    delay: this.phase0_tifone_attackrate,
                                                                                    callback: () => {
                                                                                        const fireball = this.tifone_fireball_attacks.create(x + 4 * delta_x + 50, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                                        this.time.addEvent({
                                                                                            delay: this.phase0_tifone_attackrate,
                                                                                            callback: () => {
                                                                                                const fireball = this.tifone_fireball_attacks.create(x + 3 * delta_x + 50, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                                                this.time.addEvent({
                                                                                                    delay: this.phase0_tifone_attackrate,
                                                                                                    callback: () => {
                                                                                                        const fireball = this.tifone_fireball_attacks.create(x + 2 * delta_x + 50, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                                                        this.time.addEvent({
                                                                                                            delay: this.phase0_tifone_attackrate,
                                                                                                            callback: () => {
                                                                                                                const fireball = this.tifone_fireball_attacks.create(x + 1 * delta_x + 50, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                                                                this.time.addEvent({
                                                                                                                    delay: this.phase0_tifone_attackrate,
                                                                                                                    callback: () => {
                                                                                                                        const fireball = this.tifone_fireball_attacks.create(x + 0 * delta_x + 50, y, 'tifone_onda_frontale').setSize(15, 15).setDepth(11).setTint(0x0000fa).setScale(1.5);
                                                                                                                        this.time.addEvent({
                                                                                                                            delay: 2000,
                                                                                                                            callback: () => {
                                                                                                                                this.current_phase = 1;
                                                                                                                            }
                                                                                                                        });

                                                                                                                    }
                                                                                                                });

                                                                                                            }
                                                                                                        });

                                                                                                    }
                                                                                                });

                                                                                            }
                                                                                        });

                                                                                    }
                                                                                });

                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    }

    handlePhase1() {

        this.current_phase = 100;
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                let x = 400;
                let y = 300;
                const deltax = 100;
                this.tifone_wind_attacks.create(x, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                this.time.addEvent({
                    delay: this.phase1_tifone_attackrate,
                    callback: () => {
                        this.tifone_wind_attacks.create(x - deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                        this.time.addEvent({
                            delay: this.phase1_tifone_attackrate,
                            callback: () => {
                                this.tifone_wind_attacks.create(x + deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                this.time.addEvent({
                                    delay: this.phase1_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_wind_attacks.create(x + 2 * deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                        this.tifone_wind_attacks.create(x - 2 * deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                        this.time.addEvent({
                                            delay: this.phase1_tifone_attackrate,
                                            callback: () => {
                                                this.tifone_wind_attacks.create(x + 3 * deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                                this.time.addEvent({
                                                    delay: this.phase1_tifone_attackrate,
                                                    callback: () => {
                                                        this.tifone_wind_attacks.create(x - deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                                        this.time.addEvent({
                                                            delay: this.phase1_tifone_attackrate,
                                                            callback: () => {
                                                                this.tifone_wind_attacks.create(x + deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                                                this.time.addEvent({
                                                                    delay: this.phase1_tifone_attackrate,
                                                                    callback: () => {
                                                                        this.tifone_wind_attacks.create(x + 2 * deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                                                        this.tifone_wind_attacks.create(x - 2 * deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                                                        this.time.addEvent({
                                                                            delay: this.phase1_tifone_attackrate,
                                                                            callback: () => {
                                                                                this.tifone_wind_attacks.create(x + 3 * deltax, y, 'tifone_tornado').setSize(20, 20).setDepth(11).setScale(2);
                                                                                this.current_phase = 2;
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    }

    handlePhase2() {


        this.time.addEvent({
            delay: this.phase2_tifone_attackrate,
            callback: () => {
                let x = 0;
                let y = 550;
                this.tifone_wave_attack.create(x, y, 'tifone_onde_laterali_frame1').setSize(30, 30).setDepth(11).setScale(3.2);
                this.current_phase = 3;
            }
        });
        this.current_phase = 100;



    }

    handlePhase3() {

        this.time.addEvent({
            delay: this.phase3_tifone_attackrate,
            callback: () => {
                let x = 800;
                let y = 550;
                this.tifone_wave2_attack.create(x, y, 'tifone_onde_laterali_frame1').setSize(30, 30).setDepth(11).setScale(3.2).setFlipX(true);
                this.current_phase = 4;
            }
        });
        this.current_phase = 100;


    }

    handlePhase4() {

        this.current_phase = 100;

        this.time.addEvent({
            delay: this.phase4_tifone_attackrate,
            callback: () => {
                let x = 0;
                let y = -100;
                let deltax = 80

                const scale = 1.2;
                this.tifone_lighting_attack.create(x + 0 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                this.time.addEvent({
                    delay: this.phase4_tifone_attackrate,
                    callback: () => {
                        this.tifone_lighting_attack.create(x + 1 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                        this.time.addEvent({
                            delay: this.phase4_tifone_attackrate,
                            callback: () => {
                                this.tifone_lighting_attack.create(x + 2 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                this.time.addEvent({
                                    delay: this.phase4_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_lighting_attack.create(x + 3 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                        this.time.addEvent({
                                            delay: this.phase4_tifone_attackrate,
                                            callback: () => {
                                                this.tifone_lighting_attack.create(x + 4 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                                this.time.addEvent({
                                                    delay: this.phase4_tifone_attackrate,
                                                    callback: () => {
                                                        this.tifone_lighting_attack.create(x + 5 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                                        this.time.addEvent({
                                                            delay: this.phase4_tifone_attackrate,
                                                            callback: () => {
                                                                this.tifone_lighting_attack.create(x + 6 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                                                this.time.addEvent({
                                                                    delay: this.phase4_tifone_attackrate,
                                                                    callback: () => {
                                                                        this.tifone_lighting_attack.create(x + 7 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                                                        this.time.addEvent({
                                                                            delay: this.phase4_tifone_attackrate,
                                                                            callback: () => {
                                                                                this.tifone_lighting_attack.create(x + 8 * deltax, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                                                                this.time.addEvent({
                                                                                    delay: this.phase4_tifone_attackrate,
                                                                                    callback: () => {
                                                                                        this.tifone_lighting_attack.create(x + 9 * deltax - 40, y, 'tifone_fulmine').setSize(10, 40).setDepth(11).setScale(scale);
                                                                                        this.time.addEvent({
                                                                                            delay: this.phase4_tifone_attackrate,
                                                                                            callback: () => {
                                                                                                this.current_phase = 5;
                                                                                            }
                                                                                        })

                                                                                    }
                                                                                })

                                                                            }
                                                                        })

                                                                    }
                                                                })

                                                            }
                                                        })

                                                    }
                                                })

                                            }
                                        })

                                    }
                                })

                            }
                        })

                    }
                })

            }
        })
    }

    handlePhase5() {

        this.current_phase = 100;

        let x = -100;
        let y = 500;
        const delta_y = 30;

        this.time.addEvent({
            delay: this.phase5_tifone_attackrate,
            callback: () => {
                this.tifone_laser_attack.create(x, y, 'tifone_laser').setSize(20, 10).setDepth(11);
                this.time.addEvent({
                    delay: this.phase5_tifone_attackrate,
                    callback: () => {
                        this.tifone_laser_attack.create(x, y + delta_y, 'tifone_laser').setSize(20, 10).setDepth(11);
                        this.time.addEvent({
                            delay: this.phase5_tifone_attackrate,
                            callback: () => {
                                this.tifone_laser_attack.create(x, y + 2 * delta_y, 'tifone_laser').setSize(20, 10).setDepth(11);
                                this.time.addEvent({
                                    delay: this.phase5_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_laser_attack.create(x, y + 3 * delta_y, 'tifone_laser').setSize(20, 10).setDepth(11);
                                        this.current_phase = 6;
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }

    handlePhase6() {

        this.current_phase = 100;

        let x = 50;
        let y = 50;

        let delta_x = 75;

        this.time.addEvent({
            delay: this.phase6_tifone_attackrate,
            callback: () => {
                this.tifone_lateral_wave_attack.create(x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                this.time.addEvent({
                    delay: this.phase6_tifone_attackrate,
                    callback: () => {
                        this.tifone_lateral_wave_attack.create(x + 2 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                        this.time.addEvent({
                            delay: this.phase6_tifone_attackrate,
                            callback: () => {
                                this.tifone_lateral_wave_attack.create(x + 1 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                                this.time.addEvent({
                                    delay: this.phase6_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_lateral_wave_attack.create(x + 4 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                                        this.time.addEvent({
                                            delay: this.phase6_tifone_attackrate,
                                            callback: () => {
                                                this.tifone_lateral_wave_attack.create(x + 3 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                                                this.time.addEvent({
                                                    delay: this.phase6_tifone_attackrate,
                                                    callback: () => {
                                                        this.tifone_lateral_wave_attack.create(x + 6 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                                                        this.time.addEvent({
                                                            delay: this.phase6_tifone_attackrate,
                                                            callback: () => {
                                                                this.tifone_lateral_wave_attack.create(x + 5 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                                                                this.time.addEvent({
                                                                    delay: this.phase6_tifone_attackrate,
                                                                    callback: () => {
                                                                        this.tifone_lateral_wave_attack.create(x + 7 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                                                                        this.time.addEvent({
                                                                            delay: this.phase6_tifone_attackrate,
                                                                            callback: () => {
                                                                                this.tifone_lateral_wave_attack.create(x + 8 * delta_x, y, 'background_cloud1').setSize(25, 25).setDepth(11);
                                                                                this.current_phase = 7;
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }

    handlePhase7() {
        this.current_phase = 100;
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.current_phase = 0;
            }
        })
    }

    update_phase0_attacks() {
        this.tifone_fireball_attacks.children.each(b => {

            if (
                b.y > 1000
            ) {
                b.destroy();
                return;
            }

            b.setVelocityY(50);
        });
    }

    update_phase1_attacks() {
        this.tifone_wind_attacks.children.each(b => {
            if (b.y > 1000) {
                b.destroy();
                return;
            }

            b.setVelocityY(60);
            if (b && b.active && b.anims && !b.anims.isPlaying) {
                b.play('tornado_anim');
            }
        })
    }

    update_phase2_attacks() {

        this.tifone_wave_attack.children.each(b => {
            const wavespeed = 70;



            if (b.x < 400) {
                b.setVelocityX(wavespeed);
            } else {
                b.falling = true;
                b.setVelocityX(0);
                b.setVelocityY(wavespeed);
            }



            if (b.y > 1000) {
                b.destroy();
            }

            if (b && b.active && b.anims && !b.anims.isPlaying) {
                b.play('onde_laterali_anim');
            }
        });

    }

    update_phase3_attacks() {

        this.tifone_wave2_attack.children.each(b => {
            const wavespeed = 70;

            if (b.x > 400) {
                b.setVelocityX(-wavespeed);
            } else {
                b.falling = true;
                b.setVelocityX(0);
                b.setVelocityY(wavespeed);
            }

            if (b.y > 1000) {
                b.destroy();
            }

            if (b && b.active && b.anims && !b.anims.isPlaying) {
                b.play('onde_laterali_anim');
            }
        });

    }

    update_phase4_attacks() {
        this.tifone_lighting_attack.children.each(b => {
            const lighting_speed_y = 70;
            const lighting_speed_x = 4;

            b.setVelocityY(lighting_speed_y);
            b.setVelocityX(lighting_speed_x);
            if (b.y > 600) {
                b.destroy();
            }
        })
    }

    update_phase5_attacks() {
        this.tifone_laser_attack.children.each(b => {
            const speed_X = 150;

            b.setVelocityX(speed_X);
            if (b.x > 1200) {
                b.destroy();
            }
        });
    }

    update_phase6_attacks() {
        this.tifone_lateral_wave_attack.children.each(b => {

            const velocita_iniziale = 40;

            // movimento iniziale
            if (!b.started) {
                b.started = true;
                b.setVelocityX(velocita_iniziale);

                // timer che parte UNA SOLA VOLTA
                this.time.addEvent({
                    delay: 3000,
                    callback: () => {
                        if (b.active) {
                            b.setVelocityX(0);
                            b.setVelocityY(120);
                        }
                    }
                });
            }

            if (b.x > 900) {
                b.x = 0;
            }

            if (b.y > 700) {
                b.destroy();
            }

        });
    }


    handle_player_attacks() {
        if (!this.can_player_move) return;

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {

            if (this.time.now < this.nextPlayerShot) {
                return; // cooldown non finito
            }

            // aggiorna il prossimo tempo di sparo
            this.nextPlayerShot = this.time.now + this.player_firerate;

            const bullet = this.player_attacks.create(
                this.player.x,
                this.player.y,
                'bullets'
            ).setDepth(8).setTint(0xff0000);

            bullet.setVelocityY(-150);
        }

    }

    handle_hp_bars() {
        const playerBarMaxWidth = this.player.width + 15;
        this.player_hp_green_bar.y = this.player.y - 20;
        this.player_hp_red_bar.y = this.player.y - 20;

        this.player_hp_green_bar.x = this.player.x - playerBarMaxWidth / 2;
        this.player_hp_red_bar.x = this.player.x - playerBarMaxWidth / 2;

        this.player_hp_red_bar.width = playerBarMaxWidth;
        this.player_hp_red_bar.geom.width = playerBarMaxWidth;
        this.player_hp_red_bar.setSize(playerBarMaxWidth, 5);

        if(this.tifone){
        this.tifone_hp_red_bar.y = this.tifone.y - 200;
        this.tifone_hp_green_bar.y = this.tifone.y - 200;
        this.tifone_hp_red_bar.x = this.tifone.x - 100;
        this.tifone_hp_green_bar.x = this.tifone.x - 100;

        }


        const pLevel = this.registry.get('player_level') || 1;
        this.max_hp = this.base_max_hp * pLevel;

        const pct = this.player_hp / this.max_hp;
        let cWidth = playerBarMaxWidth * pct;
        if (cWidth < 0) cWidth = 0;
        this.player_hp_green_bar.width = cWidth ;
        this.player_hp_green_bar.geom.width = cWidth;
        this.player_hp_green_bar.setSize(cWidth, 5);
        this.player_hp_green_bar.updateDisplayOrigin();
        if (this.hpTextUI) this.hpTextUI.setText(`${(this.player_hp > 0 ? this.player_hp : 0).toFixed(0)} / ${this.max_hp}`);

        this.tifone_hp_green_bar.width = this.tifone_hp * 2;
        this.tifone_hp_green_bar.geom.width = this.tifone_hp * 2;
        this.tifone_hp_green_bar.setSize(this.tifone_hp * 2, 30);
        this.tifone_hp_green_bar.updateDisplayOrigin();
        if (this.npcHpTextUI) this.npcHpTextUI.setText(`${this.tifone_hp > 0 ? this.tifone_hp : 0} / 200`);
    }

    handlelose() {
        if (this.player_hp <= 0) {
            this.scene.stop();
            this.scene.start('SceneGameOver', { returnScene: 'Scene15' });
        }
    }

    is_ending_animation() {
        if(this.tifone_fireball_attacks) this.tifone_fireball_attacks.clear(true, true);
        if(this.tifone_wind_attacks) this.tifone_wind_attacks.clear(true, true);
        if(this.tifone_wave_attack) this.tifone_wave_attack.clear(true, true);
        if(this.tifone_wave2_attack) this.tifone_wave2_attack.clear(true, true);
        if(this.tifone_lighting_attack) this.tifone_lighting_attack.clear(true, true);
        if(this.tifone_laser_attack) this.tifone_laser_attack.clear(true, true);
        if(this.tifone_lateral_wave_attack) this.tifone_lateral_wave_attack.clear(true, true);
        if(this.tifone_falling_clouds_attack) this.tifone_falling_clouds_attack.clear(true, true);
        if (this.tifone && this.tifone.active) {
            this.tifone.setVelocityY(30);
            if (this.tifone.y > 600) {
                this.tifone.destroy();
                this.tifone = null;
                this.tifone_hp_red_bar.destroy();
                this.tifone_hp_green_bar.destroy();
                this.player_hp_green_bar.destroy();
                this.player_hp_red_bar.destroy();
            }
        }

        if (!this.tifone && !this.trilly) {
            this.trilly = this.physics.add.sprite(900, this.player.y, 'trilly');
        }

        if (this.trilly) {
            const trillyspeed = -30
            this.trilly.setVelocityX(trillyspeed);
            this.trilly.anims.play('trilly_leftwalk');

            if (this.trilly.x > this.player.x + 40) {
                this.trilly.setVelocityX(0);
                this.trilly.anims.play('trilly_stand');
                if (!this.dialogueStarted) {
                    this.dialogueStarted = true;

                    const dialogueBox = this.add.rectangle(400, 300, 700, 200, 0x000000).setOrigin(0.5).setDepth(15);
                    const dialogueBox_border = this.add.rectangle(400, 300, 680, 180).setStrokeStyle(2, 0xffffff).setOrigin(0.5).setDepth(16);
                    this.dialogue_text = [
                        'oh mio eroe',
                        'sei troppo aura',
                        'menomale che ci sei tu',
                        'ti amo',
                        ...((this.registry.get('is_player_human') === false) ? ['(sei un mostro ma per me sei okay)'] : [])
                    ];

                    this.index_dialogue = 0;

                    this.dialogue_text_obj = this.add.text(400, 300, this.dialogue_text[this.index_dialogue], {
                        fontFamily: 'Courier, monospace',
                        fontSize: '32px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 4,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(17);

                } else if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                    this.index_dialogue++;
                    if (this.index_dialogue < this.dialogue_text.length) {
                        this.dialogue_text_obj.setText(this.dialogue_text[this.index_dialogue]);
                    } else {
                        this.scene.start('SceneGameWin');
                    }
                }

            }
        }
    }
}