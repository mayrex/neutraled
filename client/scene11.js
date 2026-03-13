export default class Scene11 extends Phaser.Scene {
    constructor() {
        super('Scene11');


        // in questa scene il player non è piu un umano ma diventa un mostro e questo cambia anche le logiche di gioco,per esempio:
        // qui il player non sarà più libero di parare dove vuole ma viene rinchiuso in una box (tipo il fight con undyne) e dovrà parare i colpi avversari.
        // per vincere pero non basta parare,il player deve sparare all'avversario con il tasto invio nello stesso momento in cui pensa a parare.

        this.keys = null;

        this.current_phase = null;

        this.player = null;
        this.npc = null;
        this.player_soul = null;

        this.battle_box_rect_border = null;
        this.battle_box_rect_height = 250;
        this.battle_box_rect_width = 250;

        this.bullets = null;

        this.player_hp_bar_green = null;
        this.player_hp_bar_red = null;
        this.player_hp_bar_x = 200;
        this.player_hp_bar_y = 550;
        this.base_max_hp = 20;
        this.max_hp = 20;
        this.player_hp = 20;

        this.npc_hp_bar = null;
        this.npc_hp_bar_green = null;
        this.npc_hp_bar_red = null;
        this.npc_hp = 70;
        this.npc_hp_bar_x = 200;
        this.npc_hp_bar_y = 50;

        this.fire_rate = null;

        this.player_slash = null;
        this.where_is_player_slash = null;
        this.player_attacks = null;

        this.attack_phase = 0;
        this.attack_timer = null;

        this.last_shot = 0;
        this.canShoot = true;

        this.seconds_waiter = 60 * 5;

        this.nextPlayerShot = 0;
        this.playerFireCooldown = 400; // millisecondi

        this.npc_base_x = 400;
        this.npc_amplitude = 120;
        this.npc_speed = 0.002;

        this.moltiplicatore_hp_bar_npc = 400 / this.npc_hp
    }


    

    create() {

        
        if (!this.scene.isActive('SceneUI')) {
            this.scene.launch('SceneUI');
        }
        this.scene.bringToTop('SceneUI');
    
    

        this.player_hp = 20;
        this.npc_hp = 70;

        this.last_shot = 0;
        this.attack_phase = 0;

        this.seconds_waiter = 60 * 5;
        this.nextPlayerShot = 0;
        this.canShoot = true;


        // input
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            interact: 'ENTER'
        });


        //battlebox
        this.battle_box_rect_border = this.add.rectangle(
            400,
            300,
            this.battle_box_rect_width,
            this.battle_box_rect_height,
            0x000000).setOrigin(0.5).setStrokeStyle(
                5,
                0xffffff
            );


        // player slash
        this.player_slash = this.physics.add.sprite(400, 300 - 25, 'player_slash').setScale(3);

        // proiettili

        this.bullets = this.physics.add.group();

        this.bullets.children.each(b => {
            b.destroy();
        })

        // this.attack_timer = this.time.addEvent({
        //     delay: 5000,
        //     callback: this.nextAttackPhase,
        //     callbackScope: this,
        //     loop: true
        // });


        this.time.delayedCall(3000, () => {
            this.attack_timer = this.time.addEvent({
                delay: 5000,
                callback: this.nextAttackPhase,
                callbackScope: this,
                loop: true
            });
        });

        this.physics.add.overlap(
            this.player_slash,
            this.bullets,
            (shield, spear) => {

                if (spear.dir === this.where_is_player_slash) {
                    spear.destroy(); // parata
                }

            },
            null,
            this
        );

        // player soul
        this.player_soul = this.physics.add.staticSprite(400, 300, 'player_soul');
        this.physics.add.overlap(
            this.player_soul,
            this.bullets,
            (soul, bullet) => {

                bullet.destroy();

                this.player_hp -= (2 * (this.registry.get('player_level') || 1));
                
        const pct = this.player_hp / this.max_hp;
        let cWidth = (20 * this.base_max_hp) * pct;
        if(cWidth < 0) cWidth = 0;
        this.player_hp_bar_green.setSize(cWidth, 30);
        if(this.hpTextUI) this.hpTextUI.setText(`${this.player_hp>0?this.player_hp:0} / ${this.max_hp}`);
    

            },
            null,
            this
        );

        // player attacks
        this.player_attacks = this.physics.add.group();

        if (!this.anims.exists('enemy4_idle')) {
            this.anims.create({
                key: 'enemy4_idle',
                frames: this.anims.generateFrameNumbers('enemy4', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        }

        // npc
        this.npc = this.physics.add.sprite(400, 130, 'enemy4').setDepth(3).setScale(2);
        this.npc.play('enemy4_idle');
        this.physics.add.overlap(
            this.player_attacks,
            this.npc,
            (attack, npc) => {
                npc.destroy();
                this.npc_hp -= 2;
                this.npc_hp_bar_green.setSize(this.moltiplicatore_hp_bar_npc * this.npc_hp, 30);
                if(this.npcHpTextUI) this.npcHpTextUI.setText(`${this.npc_hp>0?this.npc_hp:0} / 70`);
            },
            null,
            this
        );




        // barre degli hp
        this.player_hp_bar_green = this.add.rectangle(
            this.player_hp_bar_x,
            this.player_hp_bar_y,
            20 * this.player_hp,
            30,
            0x00ff00
        ).setDepth(2).setOrigin(0);

        this.player_hp_bar_red = this.add.rectangle(
            this.player_hp_bar_x,
            this.player_hp_bar_y,
            20 * this.player_hp,
            30,
            0xff0000
        ).setDepth(1).setOrigin(0);


        const pLevel = this.registry.get('player_level') || 1;
        this.max_hp = this.base_max_hp * pLevel;
        if(typeof this.hp !== 'undefined') this.hp = this.max_hp;
        if(typeof this.player_hp !== 'undefined') this.player_hp = this.max_hp;

        this.hpTextUI = this.add.text(
            200 + (20 * this.base_max_hp)/2, 
            550 + 15,
            `${this.max_hp} / ${this.max_hp}`,
            {
                fontFamily: 'Courier, monospace',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(4);
    



        this.npc_hp_bar_green = this.add.rectangle(
            this.npc_hp_bar_x,
            this.npc_hp_bar_y,
            this.moltiplicatore_hp_bar_npc * this.npc_hp,
            30,
            0x00ff00
        ).setDepth(2).setOrigin(0);

        this.npc_hp_bar_red = this.add.rectangle(
            this.npc_hp_bar_x,
            this.npc_hp_bar_y,
            this.moltiplicatore_hp_bar_npc * this.npc_hp,
            30,
            0xff0000
        ).setDepth(1).setOrigin(0);


        this.npcHpTextUI = this.add.text(
            this.npc_hp_bar_x + 200, 
            this.npc_hp_bar_y + 15,
            `${this.npc_hp} / ${this.npc_hp}`,
            {
                fontFamily: 'Courier, monospace',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(4);
        

        this.events.on('shutdown', () => {

            if (this.attack_timer) {
                this.attack_timer.remove();
            }

        });
    }

    update() {
        if (this.player_hp <= 0) {
            this.scene.stop();
            this.scene.start('SceneGameOver', { returnScene: 'Scene11' });
            return;
        }


        this.handleNpcOscillation();
        this.highlightClosestBullet();

        this.handlePlayerMovement();
        this.seconds_waiter--;
        if (this.seconds_waiter <= 0) {
            this.handleEnemyBullets();
            this.handlePlayerAttack();

            this.bullets.children.each(b => {

                if (
                    b.x < -1000 ||
                    b.x > 1000 ||
                    b.y < -1000 ||
                    b.y > 1000
                ) {
                    b.destroy();
                    return;
                }

                b.setVelocity(
                    b.body.velocity.x * 0.99,
                    b.body.velocity.y * 0.99
                );

            });
        }

        this.player_attacks.children.each(a => {

            if (a.y < -50) {
                a.destroy();
            }

        });

        if (this.player_hp <= 0) {

            if (this.attack_timer) {
                this.attack_timer.remove();
            }
            this.scene.start('Scene10');
            this.scene.stop();
            this.registry.set('scene11_npc_defeated', false);
        }

        if (this.npc_hp <= 0) {

            if (this.attack_timer) {
                this.attack_timer.remove();
            }
            this.scene.start('Scene10');
            this.scene.stop();
            this.registry.set('scene11_npc_defeated', true); 
            this.registry.set('player_level', (this.registry.get('player_level') || 1) + 1);

        }
    }



    handlePlayerMovement() {

        if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
            this.where_is_player_slash = 0;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
            this.where_is_player_slash = 1;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
            this.where_is_player_slash = 2;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
            this.where_is_player_slash = 3;
        }

        const delta_space = 25;
        switch (this.where_is_player_slash) {
            case 0:
                this.player_slash.x = 400;
                this.player_slash.y = 300 - delta_space;
                this.player_slash.setAngle(0);
                break;
            case 1:
                this.player_slash.x = 400;
                this.player_slash.y = 300 + delta_space;
                this.player_slash.setAngle(180);

                break;
            case 2:
                this.player_slash.x = 400 - delta_space;
                this.player_slash.y = 300;
                this.player_slash.setAngle(270);
                break;
            case 3:

                this.player_slash.x = 400 + delta_space;
                this.player_slash.y = 300;
                this.player_slash.setAngle(90);
                break;
        }


    }

    handleEnemyBullets() {

        switch (this.attack_phase) {

            case 0:
                this.phaseBasicSpears();
                break;

            case 1:
                this.phaseDouble();
                break;

            case 2:
                this.phaseCross();
                break;
        }

    }

    handlePlayerAttack() {

        if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {

            if (this.time.now < this.nextPlayerShot) return;

            this.nextPlayerShot = this.time.now + this.playerFireCooldown;

            const attack = this.player_attacks.create(400, 300, 'attack').setTint(0xff0000); // rosso;;

            const speed = 400;
            attack.setVelocityY(-speed);

        }

    }

    spawnSpear(dir) {
        const centerX = 400;
        const centerY = 300;
        const offset = 200;
        let x = centerX;
        let y = centerY;

        switch (dir) {
            case 0: y = centerY - offset; break; // sopra
            case 1: y = centerY + offset; break; // sotto
            case 2: x = centerX - offset; break; // sinistra
            case 3: x = centerX + offset; break; // destra
        }

        const spear = this.bullets.create(x, y, 'bullet');
        spear.dir = dir;

        // velocità iniziale basata sulla direzione
        const speed = 250;
        switch (dir) {
            case 0: spear.setVelocityY(speed); break; // sopra
            case 1: spear.setVelocityY(-speed); break;  // sotto
            case 2: spear.setVelocityX(speed); break; // sinistra
            case 3: spear.setVelocityX(-speed); break;  // destra
        }
    }

    phaseBasicSpears() {
        if (this.canShoot) {
            this.canShoot = false;
            this.spawnSequence([0, 1, 2, 3], 250);
            this.time.delayedCall(2000, () => { this.canShoot = true; });
        }
    }

    phaseCross() {

        if (this.time.now < this.last_shot) return;

        this.last_shot = this.time.now + 2500;

        this.spawnSequence(
            [0, 3, 1, 2, 0, 3, 1, 2],
            150
        );

    }

    phaseDouble() {

        if (this.time.now < this.last_shot) return;

        this.last_shot = this.time.now + 2200;

        this.spawnSequence([2, 3, 2, 3, 0, 1], 200);

    }

    nextAttackPhase() {

        this.attack_phase++;

        if (this.attack_phase > 2) {
            this.attack_phase = 0;
        }

    }

    spawnSequence(sequence, delay) {
        sequence.forEach((dir, i) => {
            this.time.delayedCall(i * delay, () => {
                this.spawnSpear(dir);
            });
        });
    }

    handleNpcOscillation() {

        const t = this.time.now;

        this.npc.x = this.npc_base_x +
            this.npc_amplitude * Math.sin(t * this.npc_speed);

    }

    getClosestBulletToCenter() {
        const centerX = 400;
        const centerY = 300;

        let closestBullet = null;
        let minDist = Infinity;

        this.bullets.children.each(b => {
            const dx = b.x - centerX;
            const dy = b.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                closestBullet = b;
            }
        });

        return closestBullet;
    }


    highlightClosestBullet() {
        const closest = this.getClosestBulletToCenter();

        this.bullets.children.each(b => {
            if (b === closest) {
                b.setTint(0x0000ff); // blu
            } else {
                b.clearTint();       // ripristina colore originale
            }
        });
    }




}