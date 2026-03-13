import Phaser from 'phaser';

export default class SceneCredits extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneCredits' });
    }

    create() {
        // Create radial colored background
        this.createBackground();

        // Close button (X) on top right
        const closeBtn = this.add.text(760, 40, 'X', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#ff0000',
            padding: { left: 15, right: 15, top: 5, bottom: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Credits Title
        this.add.text(400, 60, 'CREDITS', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Credits Text
        const creditsText = [
            "Angelo del piano: developer",
            "Domenico russo: developer",
            "Chiara maisto: graphics designer",
            "Paolo romano: graphics designer",
            "Simone alfè: sounds maker",
            "Raffaele capuano: editor",
            "Antonio verde: graphics designer",
            "Francesco coppola: graphics designer",
            "Carlo fabozzo: graphics designer",
            "Matteo de rosa: graphics designer",
            "Cristiano cavallo: graphics designer",
            "Salvatore tamburrino: sounds maker",
            "Alessandro pezone: sounds maker",
            "Alessandro Petrarca: graphics designer"
        ];

        let startY = 135;
        const lineSpacing = 30;

        creditsText.forEach((line) => {
            this.add.text(400, startY, line.toUpperCase(), {
                fontSize: '20px',
                fontFamily: 'monospace',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            startY += lineSpacing;
        });
    }

    createBackground() {
        const W = 800, H = 600;
        const key = 'credits_bg_canvas';

        if (!this.textures.exists(key)) {
            const canvas = this.textures.createCanvas(key, W, H);
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 600);
            grad.addColorStop(0, '#2a2a3e');
            grad.addColorStop(0.5, '#16213e');
            grad.addColorStop(1, '#000000');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
            canvas.refresh();
        }

        this.add.image(400, 300, key).setDepth(0);
    }
}
