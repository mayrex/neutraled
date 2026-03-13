export default class SceneVictory extends Phaser.Scene {
    constructor() {
        super('SceneVictory');
        this.nextScene = '';
    }

    init(data) {
        this.nextScene = data.nextScene || 'Scene1';
    }

    create() {
        this.cameras.main.setBackgroundColor('#000033');

        // Stop UI just in case it's floating above this
        if (this.scene.isActive('SceneUI')) {
            this.scene.stop('SceneUI');
        }

        const currentLevel = this.registry.get('player_level') || 1;

        this.add.text(400, 200, 'OTTIMO LAVORO!', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '48px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 320, `Sei Salito al Livello ${currentLevel}!`, {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '32px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 450, 'Premi INVIO per Continuare', {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start(this.nextScene);
        });
    }
}
