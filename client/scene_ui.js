export default class SceneUI extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneUI' });
    }

    create() {
        // Posizioniamo la UI in alto a destra
        const uiX = 650;
        const uiY = 30;
        
        // Sfondo nero con bordo dorato
        this.add.rectangle(uiX, uiY, 160, 40, 0x000000)
            .setStrokeStyle(3, 0xffd700)
            .setOrigin(0.5);

        // Testo del livello
        this.levelText = this.add.text(uiX, uiY, this.getLevelString(), {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '18px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Ascolta i cambiamenti di dati nel registry globale
        this.registry.events.on('changedata', this.updateData, this);
    }

    getLevelString() {
        // Se non esiste, default a 1
        const level = this.registry.get('player_level') || 1;
        return `LIVELLO: ${level}`;
    }

    updateData(parent, key, data) {
        if (key === 'player_level') {
            this.levelText.setText(this.getLevelString());
            this.playBounceAnimation();
        }
    }

    playBounceAnimation() {
        // Crea una piccola animazione di rimbalzo per gratificare il level up
        this.tweens.add({
            targets: this.levelText,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 150,
            yoyo: true,
            ease: 'Power1'
        });
    }
}
