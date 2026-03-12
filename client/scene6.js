export default class Scene6 extends Phaser.Scene {

    constructor() {
        super("Scene6");

        this.player = null;
        this.shield = null;
        this.enemy = null;

        this.bullets = null;

        this.keys = null;

        this.playerSpeed = 4;

        this.hp = 20;
        this.hpBarGreen = null;
        this.hpBarRed = null;

        this.battleBoxWidth = 250;
        this.battleBoxHeight = 250;

        this.battleBox = null;

        this.guideText = null;

        this.isBattleActive = true;
    }



    create() {

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
            'enemy1'
        ).setScale(3);

        // BULLET GROUP

        this.bullets = this.physics.add.group();


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


        // hp

        this.hp = 20;

        // UI

        this.guideText = this.add.text(
            400,
            300,
            "corri verso i proiettili per pararli",
            {
                fontSize: '28px',
                color: '#ffffff',
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

        // ATTACK LOOP

        this.time.addEvent({
            delay: 4000,
            loop: true,
            callback: this.startAttackPattern,
            callbackScope: this
        });

        this.time.addEvent({
            delay:40000,
            loop:false,
            callback: this.win_script,
            callbackScope:this
        });
        

        

    }

    update() {

        if (!this.isBattleActive) return;


        
        this.handleMovement();

    }

    handleMovement() {

        if (this.keys.up.isDown) {
            this.shield.y -= this.playerSpeed;
        }

        if (this.keys.down.isDown) {
            this.shield.y += this.playerSpeed;
        }

        if (this.keys.left.isDown) {
            this.shield.x -= this.playerSpeed;
        }

        if (this.keys.right.isDown) {
            this.shield.x += this.playerSpeed;
        }

        // LIMITI BOX

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

        const bullet = this.bullets.create(x, y, 'bullet');

        return bullet;

    }

    blockBullet( shield,bullet) {

        if (!bullet.active) return;

        bullet.destroy();

    }


    hitPlayer( player,bullet) {

        if (!bullet.active) return;

        bullet.destroy();

        this.damagePlayer();

        this.guideText.setText(
            "se non li pari ti fanno danno"
        );

    }

    damagePlayer() {

    this.hp -= 2;

    if (this.hp < 0) {
        this.hp = 0;
    }

    this.hpBarGreen.setSize(20 * this.hp, 30);

    if (this.hp === 0) {

        this.registry.set('enemy1_defeated', false);
        this.scene.start('Scene5');

    }

}

    // ATTACKS

    fanAttack() {

        const centerX = 400;
        const centerY = 50;

        for (let i = -3; i <= 3; i++) {

            const bullet = this.spawnBullet(centerX, centerY);

            const angle = Phaser.Math.DegToRad(90 + i * 10);

            const speed = 150;

            bullet.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

        }

    }

    rainAttack() {

        for (let i = 0; i < 15; i++) {

            this.time.delayedCall(i * 200, () => {

                const x = Phaser.Math.Between(280, 520);

                const bullet = this.spawnBullet(x, 40);

                bullet.setVelocityY(150);

            });

        }

    }

    spiralAttack() {

        let angle = 0;

        this.time.addEvent({

            delay: 100,
            repeat: 40,

            callback: () => {

                const bullet = this.spawnBullet(400, 100);

                const speed = 180;

                bullet.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );

                angle += 0.3;

            }

        });

    }

    homingAttack() {

        const bullet = this.spawnBullet(400, 50);

        this.time.addEvent({

            delay: 100,
            repeat: 50,

            callback: () => {

                if (!bullet.active) return;

                this.physics.moveToObject(
                    bullet,
                    this.player,
                    120
                );

            }

        });

    }

    startAttackPattern() {

        const attacks = [
            this.fanAttack,
            this.rainAttack,
            this.spiralAttack,
            this.homingAttack
        ];

        const attack = Phaser.Utils.Array.GetRandom(attacks);

        attack.call(this);

    }

    endBattle(victory) {

        this.isBattleActive = false;

        if (victory) {

            if(this.hp> 0){
            this.guideText.setText(
                "complimenti hai neutralizzato il mostro!"
            );

            this.time.delayedCall(2000, () => {

                this.registry.set(
                    "enemy1_defeated",
                    true
                );

                this.scene.start("Scene5");

            });
        }

        }

    }

     win_script(){

        if(this.hp>0){
        this.registry.set('enemy1_defeated',true);
        this.scene.start('Scene5');
        }else {
            this.registry.set('enemy1_defeated',false);
            this.scene.stop();
        this.scene.start('Scene5');
        }
     }

}