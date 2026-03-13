export default class SceneGameOver extends Phaser.Scene {
    constructor() {
        super('SceneGameOver');
        this.returnScene = '';
    }

    init(data) {
        this.returnScene = data.returnScene || 'Scene1';
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(400, 250, 'GAME OVER', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '64px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 400, 'Premi INVIO per Riprovare', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start(this.returnScene);
        });
    }
}
