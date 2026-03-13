export default class SceneGameWin extends Phaser.Scene {
    constructor() {
        super('SceneGameWin');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        if (this.scene.isActive('SceneUI')) {
            this.scene.stop('SceneUI');
        }

        this.add.text(400, 250, 'HAI VINTO!', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '64px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 400, 'Premi INVIO per tornare al Menu Principale', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => {
            // Reset player level to 1 when returning to title
            this.registry.set('player_level', 1);
            this.scene.start('Scene1');
        });
    }
}
