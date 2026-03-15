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
            fontSize: '14px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Ascolta i cambiamenti di dati nel registry globale
        this.registry.events.on('changedata', this.updateData, this);

        // Fix 20: Prompt di ritorno al menu principale
        this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        this.isPromptActive = false;
        this.promptTimer = null;

        // Centrato nello schermo (assumendo 800x600 o simile)
        this.returnPromptBg = this.add.rectangle(400, 300, 600, 120, 0x000000, 0.8)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5)
            .setDepth(100)
            .setVisible(false);

        this.returnPromptText = this.add.text(400, 300, "sei sicuro di voler tornare al menu?\nclicca 'B' per confermare", {
            fontFamily: '"Press Start 2P", Courier, monospace',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10,
            wordWrap: { width: 580 }
        }).setOrigin(0.5).setDepth(101).setVisible(false);

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

    update() {
        // Fix 20: Gestione pressione tasto 'B' per tornare al menu
        if (Phaser.Input.Keyboard.JustDown(this.bKey)) {
            if (!this.isPromptActive) {
                // Prima pressione: mostra il prompt
                this.isPromptActive = true;
                this.returnPromptBg.setVisible(true);
                this.returnPromptText.setVisible(true);

                this.promptTimer = this.time.delayedCall(3000, () => {
                    this.isPromptActive = false;
                    this.returnPromptBg.setVisible(false);
                    this.returnPromptText.setVisible(false);
                });
            } else {
                // Seconda pressione: conferma e torna al menu
                if (this.promptTimer) {
                    this.promptTimer.remove();
                }

                this.isPromptActive = false;
                this.returnPromptBg.setVisible(false);
                this.returnPromptText.setVisible(false);

                // Ferma tutte le scene attive tranne Scene1
                this.scene.manager.scenes.forEach(s => {
                    if (s.scene.key !== 'SceneUI' && s.scene.key !== 'Scene1' && s.scene.isActive(s.scene.key)) {
                        this.scene.stop(s.scene.key);
                    }
                });

                // Reset variabili di stato globali registry
                this.registry.set('player_level', 1);
                this.registry.set('is_player_human', true);
                this.registry.set('returning_from_scene12', false);
                this.registry.set('scene11_npc_defeated', false);
                this.registry.set('scene13_npc_defeated', false);
                this.registry.set('enemy1_defeated', false);

                // Ferma audio in riproduzione
                this.sound.stopAll();

                // Vai al Menu
                this.scene.start('MenuScene');
            }
        }
    }
}
