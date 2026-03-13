export default class Scene9 extends Phaser.Scene {

    constructor() {
        super("Scene9");

        this.player = null;
        this.shield = null;
        this.enemy = null;

        this.bullets = null;

        this.keys = null;

        this.playerSpeed = 4;

        this.base_max_hp = 20;
        this.max_hp = 20;
        this.hp = 20;
        this.hpBarGreen = null;
        this.hpBarRed = null;

        this.battleBoxWidth = 250;
        this.battleBoxHeight = 250;

        this.battleBox = null;

        this.guideText = null;

        this.isBattleActive = true;

        this.currentPhase = 0;
        this.gravityEnabled = false;
    }

    

    create() {

        this.isBattleActive = true;
        this.currentPhase = 0;
        this.gravityEnabled = false;

        
        if (!this.scene.isActive('SceneUI')) {
            this.scene.launch('SceneUI');
        }
        this.scene.bringToTop('SceneUI');
    
    


        // INPUT

        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });

        // BATTLE BOX

        this.battleBox = this.add.rectangle(
            400,
            300,
            this.battleBoxWidth,
            this.battleBoxHeight
        ).setStrokeStyle(5, 0xffffff);

        // PLAYER

        this.player = this.physics.add.sprite(
            400,
            500,
            'player'
        ).setScale(3);

        // SHIELD

        this.shield = this.physics.add.sprite(
            400,
            300,
            'shield'
        ).setScale(1.5);

        // ENEMY

        this.enemy = this.add.sprite(
            400,
            100,
            'enemy3_frame1'
        ).setScale(4);

        // BULLET GROUP

        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 100,
            runChildUpdate: true
        }).setTint(0xff00ff);


        // COLLISIONS


        this.physics.add.overlap(
            this.shield,
            this.bullets,
            this.blockBullet,
            null,
            this
        );

        this.physics.add.overlap(
            this.bullets,
            this.player,
            this.hitPlayer,
            null,
            this
        );

        this.floor = this.add.rectangle(
            this.battleBox.x,
            this.battleBox.y + this.battleBoxHeight / 2,
            this.battleBoxWidth,
            10,
            0xffffff
        );

        this.ceiling = this.add.rectangle(
            this.battleBox.x,
            this.battleBox.y - this.battleBoxHeight / 2,
            this.battleBoxWidth,
            10,
            0xffffff
        );

        this.wallLeft = this.add.rectangle(
            this.battleBox.x - this.battleBoxWidth / 2,
            this.battleBox.y,
            10,
            this.battleBoxHeight,
            0xffffff
        );

        this.wallRight = this.add.rectangle(
            this.battleBox.x + this.battleBoxWidth / 2,
            this.battleBox.y,
            10,
            this.battleBoxHeight,
            0xffffff
        );

        this.physics.add.existing(this.wallRight, true);
        this.physics.add.collider(this.shield, this.wallRight);

        this.physics.add.existing(this.wallLeft, true);
        this.physics.add.collider(this.shield, this.wallLeft);

        this.physics.add.existing(this.ceiling, true);

        this.physics.add.collider(this.shield, this.ceiling);

        this.physics.add.existing(this.floor, true);

        this.physics.add.collider(this.shield, this.floor);
        this.shield.setCollideWorldBounds(true);



        // UI

        this.guideText = this.add.text(
            400,
            300,
            "corri verso i proiettili per pararli",
            {
                fontSize: '28px',
                color: '#ffffff', 
            fontFamily: 'Courier, monospace',
            stroke: '#000000',
            strokeThickness: 4,
                align: 'center',
                wordWrap: { width: 250 }
            }
        ).setOrigin(0.5);

        this.hpBarGreen = this.add.rectangle(
            200,
            550,
            20 * this.hp,
            30,
            0x00ff00
        ).setOrigin(0).setDepth(2);

        this.hpBarRed = this.add.rectangle(
            200,
            550,
            20 * this.hp,
            30,
            0xff0000
        ).setOrigin(0).setDepth(1);


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
    

        // ATTACK LOOP

        this.time.addEvent({
            delay: 4000,
            loop: true,
            callback: this.startAttackPattern,
            callbackScope: this
        });

        this.time.addEvent({
            delay: 40000,
            loop: false,
            callback: this.win_script,
            callbackScope: this
        });

        this.time.addEvent({
            delay: 8000,
            loop: true,
            callback: this.nextPhase,
            callbackScope: this
        });

        if (!this.registry.get('is_player_human')) {
            this.player.setTexture('monster_player_downwalking_frame1');
        }
    }

    update() {

        if (!this.isBattleActive) return;


        this.handleMovement();

        this.bullets.children.each((bullet) => {

            if (!bullet.active) return;

            if (
                bullet.x < 0 ||
                bullet.x > 800 ||
                bullet.y < 0 ||
                bullet.y > 600
            ) {
                bullet.destroy();
            }

        });


        if (this.gravityEnabled) {
            // Forza gravitazionale
            if (this.currentPhase === 4) {
                this.shield.body.velocity.x += 5; // spinge verso destra
            } else if (this.currentPhase === 3) {
                this.shield.body.velocity.x -= 5; // spinge verso sinistra
            } else if (this.currentPhase === 1) {
                this.shield.body.velocity.y += 5; // verso il basso
            } else if (this.currentPhase === 2) {
                this.shield.body.velocity.y -= 5; // verso l'alto
            }
        }


    }

    handleMovement() {

        if (!this.gravityEnabled) {
            // Movimento libero
            if (this.keys.up.isDown) this.shield.y -= this.playerSpeed;
            if (this.keys.down.isDown) this.shield.y += this.playerSpeed;
            if (this.keys.left.isDown) this.shield.x -= this.playerSpeed;
            if (this.keys.right.isDown) this.shield.x += this.playerSpeed;
        } else {
            // Gravità attiva
            const body = this.shield.body;

            // Movimento orizzontale
            if (this.keys.left.isDown) body.setVelocityX(-200);
            else if (this.keys.right.isDown) body.setVelocityX(200);
            else body.setVelocityX(0);

            // Salto solo se "sul lato corretto" rispetto alla gravità
            if (this.keys.up.isDown) {
                // Determiniamo lato solido in base alla direzione della gravità
                const gravX = body.gravity.x;
                const gravY = body.gravity.y;

                if (gravY > 0 && body.blocked.down) body.setVelocityY(-300);      // gravità verso il basso
                else if (gravY < 0 && body.blocked.up) body.setVelocityY(300);   // gravità verso l’alto
                else if (gravX > 0 && body.blocked.right) body.setVelocityX(-300); // gravità verso destra
                else if (gravX < 0 && body.blocked.left) body.setVelocityX(300);  // gravità verso sinistra
            }
        }

        // Limiti del box (sempre in base al mondo)
        this.shield.x = Phaser.Math.Clamp(
            this.shield.x,
            this.battleBox.x - this.battleBoxWidth / 2 + 12,
            this.battleBox.x + this.battleBoxWidth / 2 - 12
        );

        this.shield.y = Phaser.Math.Clamp(
            this.shield.y,
            this.battleBox.y - this.battleBoxHeight / 2 + 12,
            this.battleBox.y + this.battleBoxHeight / 2 - 12
        );
    }

    spawnBullet(x, y) {

        const bullet = this.bullets.create(x, y, 'bullet').setTint(0xff00ff);

        return bullet;

    }

    blockBullet(shield, bullet) {

        if (!bullet.active) return;

        bullet.destroy();

    }


    hitPlayer(player, bullet) {

        if (!bullet.active) return;

        bullet.destroy();

        this.damagePlayer();

        this.guideText.setText(
            "se non li pari ti fanno danno"
        );

    }

    damagePlayer() {

        this.hp -= (2 * (this.registry.get('player_level') || 1));

        if (this.hp < 0) {
            this.hp = 0;
        }

        
        const pct = this.hp / this.max_hp;
        let cWidth = (20 * this.base_max_hp) * pct;
        if(cWidth < 0) cWidth = 0;
        this.hpBarGreen.setSize(cWidth, 30);
        if(this.hpTextUI) this.hpTextUI.setText(`${this.hp>0?this.hp:0} / ${this.max_hp}`);
    

        if (this.hp === 0) {
            this.registry.set('enemy3_defeated', false);
            this.scene.stop();
            this.scene.start('Scene8');
        }



    }

    nextPhase() {

        const phase = Phaser.Math.Between(0, 2)

        switch (phase) {

            case 0:
                this.enableFreePhase()
                break

            case 1:
                this.enableGravityDown()
                break

            case 2:
                this.enableGravityUp()
                break
        }

    }

    enableFreePhase() {

        this.gravityEnabled = false;

        this.shield.body.setAllowGravity(false);
        this.shield.body.setVelocity(0);
        this.shield.setAngle(0);

        this.guideText.setText("fase libera: para i proiettili");

    }


    enableGravityDown() {
        this.gravityEnabled = true
        this.setGravityDirection(0, 400)
        this.guideText.setText("gravità verso il basso")
        this.shield.x = 400
        this.shield.y = 300
        this.shield.setAngle(0);
    }

    enableGravityUp() {
        this.gravityEnabled = true
        this.setGravityDirection(0, -400)
        this.guideText.setText("gravità verso l'alto")
        this.shield.x = 400
        this.shield.y = 300
        this.shield.setAngle(180);

    }


    setGravityDirection(x, y) {
        this.shield.body.setAllowGravity(true);
        this.shield.body.setGravityX(x);
        this.shield.body.setGravityY(y);

        // Reset velocità residua
        this.shield.body.setVelocity(0, 0);
    }

    // ATTACKS

    attackWall() {

        for (let i = -120; i <= 120; i += 30) {

            const bullet = this.spawnBullet(
                this.enemy.x + i,
                this.enemy.y
            )

            bullet.setVelocityY(250)

        }

    }




    attackSpiral() {

        let angle = 0

        this.time.addEvent({

            repeat: 20,
            delay: 120,

            callback: () => {

                const bullet = this.spawnBullet(
                    this.enemy.x,
                    this.enemy.y
                )

                const speed = 200

                bullet.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                )

                angle += 0.3

            }

        })

    }

    startAttackPattern() {

        let attacks

        if (!this.gravityEnabled) {
            attacks = [
                this.attackCircle,
                this.attackSpiral
            ]
        } else {
            attacks = [
                this.attackRain,
                this.attackWall
            ]
        }

        const attack = Phaser.Utils.Array.GetRandom(attacks)

        attack.call(this)

    }

    attackCircle() {

        const bulletCount = 12;
        const speed = 200;

        for (let i = 0; i < bulletCount; i++) {

            const angle = (i / bulletCount) * Math.PI * 2;

            const bullet = this.spawnBullet(
                this.enemy.x,
                this.enemy.y
            );

            bullet.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

        }

    }


    attackRain() {

        for (let i = 0; i < 5; i++) {

            const x = Phaser.Math.Between(
                this.battleBox.x - this.battleBoxWidth / 2,
                this.battleBox.x + this.battleBoxWidth / 2
            );

            const bullet = this.spawnBullet(x, this.battleBox.y - this.battleBoxHeight / 2);

            bullet.setVelocityY(200);

        }

    }


    endBattle(victory) {

        this.isBattleActive = false;

        if (victory) {

            this.guideText.setText(
                "complimenti hai neutralizzato il mostro!"
            );

            this.time.delayedCall(2000, () => {

                this.registry.set('enemy3_defeated', true); 
        this.registry.set('player_level', (this.registry.get('player_level') || 1) + 1);

                this.scene.start("Scene8");

            });

        }

    }

    win_script() {

        this.registry.set('enemy3_defeated', true); 
        this.registry.set('player_level', (this.registry.get('player_level') || 1) + 1);
        this.scene.stop();
        this.scene.start('Scene8');
    }

}

