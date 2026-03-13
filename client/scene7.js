export default class Scene7 extends Phaser.Scene {

    constructor() {
        super("Scene7");

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

        this.enemyBaseX = 400;
        this.enemyAmplitude = 120;
        this.enemyFrequency = 0.002;
    }

    

    create() {

        
        if (!this.scene.isActive('SceneUI')) {
            this.scene.launch('SceneUI');
        }
        this.scene.bringToTop('SceneUI');
    
    


        this.sound.stopAll();
        this.sound.play('scene7_audio', { loop: true });

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
            'enemy2'
        ).setScale(3);

        if (!this.anims.exists('enemy2_idle')) {
            this.anims.create({
                key: 'enemy2_idle',
                frames: this.anims.generateFrameNumbers('enemy2', { start: 0, end: 8 }),
                frameRate: 6,
                repeat: -1
            });
        }
        this.enemy.play('enemy2_idle');

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


        //hp
        this.hp = 20;

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
            delay: 60000,
            loop: false,
            callback: this.win_script,
            callbackScope: this
        });

        
    }

    update(time) {

        if (!this.isBattleActive) return;

       

        this.handleMovement();

        // OSCILLAZIONE ARMONICA

        this.enemy.x = this.enemyBaseX +
            Math.sin(time * this.enemyFrequency) * this.enemyAmplitude;

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

        this.registry.set('enemy2_defeated', false);
        this.scene.start('SceneGameOver', { returnScene: 'Scene7' });

    }

}

    // ATTACKS

    fanAttack() {

        const centerX = this.enemy.x;
        const centerY = this.enemy.y;

        for (let i = -4; i <= 4; i++) {

            const bullet = this.spawnBullet(centerX, centerY);

            const angle = Phaser.Math.DegToRad(90 + i * 8);

            const speed = 200;

            bullet.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

        }

    }

    rainAttack() {

        for (let i = 0; i < 20; i++) {

            this.time.delayedCall(i * 120, () => {

                const x = Phaser.Math.Between(260, 540);

                const bullet = this.spawnBullet(x, 40);

                bullet.setVelocity(
                    Phaser.Math.Between(-50, 50),
                    180
                );

            });

        }

    }

    spiralAttack() {

        let angle = 0;

        this.time.addEvent({

            delay: 80,
            repeat: 60,

            callback: () => {

                const x = this.enemy.x;
                const y = this.enemy.y;

                const speed = 200;

                const bullet1 = this.spawnBullet(x, y);
                const bullet2 = this.spawnBullet(x, y);

                bullet1.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );

                bullet2.setVelocity(
                    Math.cos(angle + Math.PI) * speed,
                    Math.sin(angle + Math.PI) * speed
                );

                angle += 0.25;

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

            this.guideText.setText(
                "complimenti hai neutralizzato il mostro!"
            );

            this.time.delayedCall(2000, () => {

                this.registry.set(
                    "enemy2_defeated",
                    true
                );

                this.scene.start("Scene5");

            });

        }

    }

    win_script() {

        if(this.hp>0){
        this.registry.set('enemy2_defeated', true); 
        this.registry.set('player_level', (this.registry.get('player_level') || 1) + 1);
        this.scene.start('Scene5');
        }else{
            this.registry.set('enemy2_defeated',false);
            this.scene.stop();
            this.scene.start('SceneGameOver', { returnScene: 'Scene7' });
        }
    }

}