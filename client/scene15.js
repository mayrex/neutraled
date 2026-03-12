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


        // variabili della logica di gioco
        this.current_phase = 100; // è la fase di gioco (100 = pausa )
        this.player_hp = 100;
        this.tifone_hp = 100;
        this.player_damage = 1;
        this.tifone_damage = 5;
        this.phase0_tifone_attackrate = 300;//ms
        this.phase1_tifone_attackrate = 500;// ms
        this.phase2_tifone_attackrate = 5000 // ms
        this.phase3_tifone_attackrate = this.phase2_tifone_attackrate * 2// in ms
        this.phase4_tifone_attackrate = 300; //ms
        this.phase5_tifone_attackrate = 3000; //ms
        this.phase6_tifone_attackrate = 1000; //ms




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
        this.start_animation_text_speed = 10; // in millisecondi

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







    }

    // questa è la scena 15,l'ultima di questa avventura,qui il player affronta il boss finale,il re dei mostri Tifone,
    // Perché Tifone?
    // È figlio di Gea e Tartaro, descritto come un gigantesco mostro con cento teste serpentine e ali, capace di lanciare fiamme e vorticare tempeste.
    // Il mito lo descrive come la più grande minaccia per gli dei stessi, tanto che Zeus dovette combatterlo in una battaglia catastrofica.
    // La sua forza e capacità distruttiva erano tali da rappresentare il caos primordiale incarnato, un nemico quasi invincibile.
    // tutte le piu grandi storie si ispirano o alla mitologia o alla religione e anche questa lo fa,qui il player combatte come ha fatto zeus,
    // peccato per lui che puo solo schivare i suoi enormi attacchi e sparare i suoi miseri colpi che fanno solo 1 di danno mentre lui ha 200 hp




    create() {
        const livello_di_profondita_max = 10;



        // sfondo
        this.background = this.add.image(400, 300, 'background').setOrigin(0.5).setScale(3.15).setDepth(livello_di_profondita_max - 5);
        this.sky = this.add.image(400, 300, 'background_sky').setOrigin(0.5).setScale(1.6).setDepth(livello_di_profondita_max - 6);



        // tifone

        this.tifone = this.physics.add.sprite(this.tifone_x, this.tifone_y, 'tifone_frame1').setDepth(livello_di_profondita_max - 5.5).setOrigin(0.5).setScale(2);

        // attacchi di tifone


        this.tifone_fireball_attacks = this.physics.add.group();
        this.tifone_wind_attacks = this.physics.add.group();
        this.tifone_wave_attack = this.physics.add.group();
        this.tifone_wave2_attack = this.physics.add.group();
        this.tifone_lighting_attack = this.physics.add.group();
        this.tifone_laser_attack = this.physics.add.group();
        this.tifone_lateral_wave_attack = this.physics.add.group();
        this.tifone_falling_clouds_attack = this.physics.add.group();



        // rect e animazione di inizio


        this.black_rect = this.add.rectangle(
            this.black_rect_start_x
            , this.black_rect_start_y,
            this.start_rect_width,
            this.start_rect_height,
            0x0000ff
        ).setOrigin(0.5).setDepth(livello_di_profondita_max - 1);

        this.start_animation_text_obj = this.add.text(
            this.start_animation_text_x,
            this.start_animation_text_y,
            'auraaaaa'
        ).setOrigin(0.5).setDepth(livello_di_profondita_max - 1);


        // player

        this.player = this.physics.add.sprite(this.player_x, this.player_y, 'player').setDepth(livello_di_profondita_max - 3);




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

        if (this.is_rect_falling) {
            this.falling_start_animation();
        };

        if (this.is_tifone_upgoing) {
            this.tifone_upgoing_animation();
        };
        this.handleBattlePhase();

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

        const tifonespeed = 10
        if (this.tifone.y > 300) {
            this.tifone.y -= tifonespeed;
        } else {
            this.is_tifone_upgoing = false;
            this.can_player_move = true;
            this.current_phase = 0;
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

                const fireball = this.tifone_fireball_attacks.create(x, y, 'bullets').setDepth(11);
                this.time.addEvent({
                    delay: this.phase0_tifone_attackrate,
                    callback: () => {
                        const fireball = this.tifone_fireball_attacks.create(x + delta_x, y, 'bullets').setDepth(11);
                        this.time.addEvent({
                            delay: this.phase0_tifone_attackrate,
                            callback: () => {
                                const fireball = this.tifone_fireball_attacks.create(x + 2 * delta_x, y, 'bullets').setDepth(11);
                                this.time.addEvent({
                                    delay: this.phase0_tifone_attackrate,
                                    callback: () => {
                                        const fireball = this.tifone_fireball_attacks.create(x + 3 * delta_x, y, 'bullets').setDepth(11);
                                        this.time.addEvent({
                                            delay: this.phase0_tifone_attackrate,
                                            callback: () => {
                                                const fireball = this.tifone_fireball_attacks.create(x + 4 * delta_x, y, 'bullets').setDepth(11);
                                                this.time.addEvent({
                                                    delay: this.phase0_tifone_attackrate,
                                                    callback: () => {
                                                        const fireball = this.tifone_fireball_attacks.create(x + 5 * delta_x, y, 'bullets').setDepth(11);
                                                        this.time.addEvent({
                                                            delay: this.phase0_tifone_attackrate,
                                                            callback: () => {
                                                                const fireball = this.tifone_fireball_attacks.create(x + 6 * delta_x, y, 'bullets').setDepth(11);
                                                                this.time.addEvent({
                                                                    delay: this.phase0_tifone_attackrate + 4500,
                                                                    callback: () => {
                                                                        const fireball = this.tifone_fireball_attacks.create(x + 6 * delta_x + 50, y, 'bullets').setDepth(11);
                                                                        this.time.addEvent({
                                                                            delay: this.phase0_tifone_attackrate,
                                                                            callback: () => {
                                                                                const fireball = this.tifone_fireball_attacks.create(x + 5 * delta_x + 50, y, 'bullets').setDepth(11);
                                                                                this.time.addEvent({
                                                                                    delay: this.phase0_tifone_attackrate,
                                                                                    callback: () => {
                                                                                        const fireball = this.tifone_fireball_attacks.create(x + 4 * delta_x + 50, y, 'bullets').setDepth(11);
                                                                                        this.time.addEvent({
                                                                                            delay: this.phase0_tifone_attackrate,
                                                                                            callback: () => {
                                                                                                const fireball = this.tifone_fireball_attacks.create(x + 3 * delta_x + 50, y, 'bullets').setDepth(11);
                                                                                                this.time.addEvent({
                                                                                                    delay: this.phase0_tifone_attackrate,
                                                                                                    callback: () => {
                                                                                                        const fireball = this.tifone_fireball_attacks.create(x + 2 * delta_x + 50, y, 'bullets').setDepth(11);
                                                                                                        this.time.addEvent({
                                                                                                            delay: this.phase0_tifone_attackrate,
                                                                                                            callback: () => {
                                                                                                                const fireball = this.tifone_fireball_attacks.create(x + 1 * delta_x + 50, y, 'bullets').setDepth(11);
                                                                                                                this.time.addEvent({
                                                                                                                    delay: this.phase0_tifone_attackrate,
                                                                                                                    callback: () => {
                                                                                                                        const fireball = this.tifone_fireball_attacks.create(x + 0 * delta_x + 50, y, 'bullets').setDepth(11);
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
                this.tifone_wind_attacks.create(x, y, 'bullets').setDepth(11);
                this.time.addEvent({
                    delay: this.phase1_tifone_attackrate,
                    callback: () => {
                        this.tifone_wind_attacks.create(x - deltax, y, 'bullets').setDepth(11);
                        this.time.addEvent({
                            delay: this.phase1_tifone_attackrate,
                            callback: () => {
                                this.tifone_wind_attacks.create(x + deltax, y, 'bullets').setDepth(11);
                                this.time.addEvent({
                                    delay: this.phase1_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_wind_attacks.create(x + 2 * deltax, y, 'bullets').setDepth(11);
                                        this.tifone_wind_attacks.create(x - 2 * deltax, y, 'bullets').setDepth(11);
                                        this.time.addEvent({
                                            delay: this.phase1_tifone_attackrate,
                                            callback: () => {
                                                this.tifone_wind_attacks.create(x + 3 * deltax, y, 'bullets').setDepth(11);
                                                this.time.addEvent({
                                                    delay: this.phase1_tifone_attackrate,
                                                    callback: () => {
                                                        this.tifone_wind_attacks.create(x - deltax, y, 'bullets').setDepth(11);
                                                        this.time.addEvent({
                                                            delay: this.phase1_tifone_attackrate,
                                                            callback: () => {
                                                                this.tifone_wind_attacks.create(x + deltax, y, 'bullets').setDepth(11);
                                                                this.time.addEvent({
                                                                    delay: this.phase1_tifone_attackrate,
                                                                    callback: () => {
                                                                        this.tifone_wind_attacks.create(x + 2 * deltax, y, 'bullets').setDepth(11);
                                                                        this.tifone_wind_attacks.create(x - 2 * deltax, y, 'bullets').setDepth(11);
                                                                        this.time.addEvent({
                                                                            delay: this.phase1_tifone_attackrate,
                                                                            callback: () => {
                                                                                this.tifone_wind_attacks.create(x + 3 * deltax, y, 'bullets').setDepth(11);
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
                let y = 500;
                this.tifone_wave_attack.create(x, y, 'bullets').setDepth(11);
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
                let y = 500;
                this.tifone_wave2_attack.create(x, y, 'bullets').setDepth(11);
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

                this.tifone_lighting_attack.create(x + 0 * deltax, y, 'bullets').setDepth(11);
                this.time.addEvent({
                    delay: this.phase4_tifone_attackrate,
                    callback: () => {
                        this.tifone_lighting_attack.create(x + 1 * deltax, y, 'bullets').setDepth(11);
                        this.time.addEvent({
                            delay: this.phase4_tifone_attackrate,
                            callback: () => {
                                this.tifone_lighting_attack.create(x + 2 * deltax, y, 'bullets').setDepth(11);
                                this.time.addEvent({
                                    delay: this.phase4_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_lighting_attack.create(x + 3 * deltax, y, 'bullets').setDepth(11);
                                        this.time.addEvent({
                                            delay: this.phase4_tifone_attackrate,
                                            callback: () => {
                                                this.tifone_lighting_attack.create(x + 4 * deltax, y, 'bullets').setDepth(11);
                                                this.time.addEvent({
                                                    delay: this.phase4_tifone_attackrate,
                                                    callback: () => {
                                                        this.tifone_lighting_attack.create(x + 5 * deltax, y, 'bullets').setDepth(11);
                                                        this.time.addEvent({
                                                            delay: this.phase4_tifone_attackrate,
                                                            callback: () => {
                                                                this.tifone_lighting_attack.create(x + 6 * deltax, y, 'bullets').setDepth(11);
                                                                this.time.addEvent({
                                                                    delay: this.phase4_tifone_attackrate,
                                                                    callback: () => {
                                                                        this.tifone_lighting_attack.create(x + 7 * deltax, y, 'bullets').setDepth(11);
                                                                        this.time.addEvent({
                                                                            delay: this.phase4_tifone_attackrate,
                                                                            callback: () => {
                                                                                this.tifone_lighting_attack.create(x + 8 * deltax, y, 'bullets').setDepth(11);
                                                                                this.time.addEvent({
                                                                                    delay: this.phase4_tifone_attackrate,
                                                                                    callback: () => {
                                                                                        this.tifone_lighting_attack.create(x + 9 * deltax, y, 'bullets').setDepth(11);
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
                this.tifone_laser_attack.create(x, y, 'bullets').setDepth(11);
                this.time.addEvent({
                    delay: this.phase5_tifone_attackrate,
                    callback: () => {
                        this.tifone_laser_attack.create(x, y, 'bullets').setDepth(11);
                        this.time.addEvent({
                            delay: this.phase5_tifone_attackrate,
                            callback: () => {
                                this.tifone_laser_attack.create(x, y, 'bullets').setDepth(11);
                                this.time.addEvent({
                                    delay: this.phase5_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_laser_attack.create(x, y, 'bullets').setDepth(11);
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
                this.tifone_lateral_wave_attack.create(x, y, 'bullets').setDepth(11);
                this.time.addEvent({
                    delay: this.phase6_tifone_attackrate,
                    callback: () => {
                        this.tifone_lateral_wave_attack.create(x + 2 * delta_x, y, 'bullets').setDepth(11);
                        this.time.addEvent({
                            delay: this.phase6_tifone_attackrate,
                            callback: () => {
                                this.tifone_lateral_wave_attack.create(x + 1 * delta_x, y, 'bullets').setDepth(11);
                                this.time.addEvent({
                                    delay: this.phase6_tifone_attackrate,
                                    callback: () => {
                                        this.tifone_lateral_wave_attack.create(x + 4 * delta_x, y, 'bullets').setDepth(11);
                                        this.time.addEvent({
                                            delay: this.phase6_tifone_attackrate,
                                            callback: () => {
                                                this.tifone_lateral_wave_attack.create(x + 3 * delta_x, y, 'bullets').setDepth(11);
                                                this.time.addEvent({
                                                    delay: this.phase6_tifone_attackrate,
                                                    callback: () => {
                                                        this.tifone_lateral_wave_attack.create(x + 6 * delta_x, y, 'bullets').setDepth(11);
                                                        this.time.addEvent({
                                                            delay: this.phase6_tifone_attackrate,
                                                            callback: () => {
                                                                this.tifone_lateral_wave_attack.create(x + 5 * delta_x, y, 'bullets').setDepth(11);
                                                                this.time.addEvent({
                                                                    delay: this.phase6_tifone_attackrate,
                                                                    callback: () => {
                                                                        this.tifone_lateral_wave_attack.create(x + 7 * delta_x, y, 'bullets').setDepth(11);
                                                                        this.time.addEvent({
                                                                            delay: this.phase6_tifone_attackrate,
                                                                            callback: () => {
                                                                                this.tifone_lateral_wave_attack.create(x + 8 * delta_x, y, 'bullets').setDepth(11);
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
        })
    }

    update_phase2_attacks() {

        this.tifone_wave_attack.children.each(b => {
            const wavespeed = 50;



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

        });

    }

    update_phase3_attacks() {

        this.tifone_wave2_attack.children.each(b => {
            const wavespeed = 50;

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
            const speed_X = 100;

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
                            b.setVelocityY(60);
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
}

