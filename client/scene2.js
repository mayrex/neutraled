/**
 * Scene2 – Cutscene di introduzione stile Undertale
 *
 * Layout:
 *   TOP  (0–340px)  → immagine carousel a piena larghezza
 *   BOT  (340–600px) → riquadro dialogo con typing effect
 *
 * Per le slide isSprite=true compare anche il ritratto animato del
 * personaggio parlante (sprite5) sovrapposto in basso-sinistra dell'immagine.
 *
 * Struttura slide → immagine:
 *   blocco 0  testi 0-2   → scene2_1  (personaggio intro)
 *   blocco 1  testo  3    → scene2_2  (umani e mostri in pace)
 *   blocco 2  testo  4    → scene2_3  (confine tra le razze)
 *   blocco 3  testi 5-6   → scene2_4  (invasione umana)
 *   blocco 4  testo  7    → scene2_5  (dichiarazione di guerra)
 *   blocco 5  testi 8-12  → scene2_5  (personaggio epilogo)
 */
export default class Scene2 extends Phaser.Scene {

    constructor() {
        super('Scene2');

        this.SLIDES = [
            // blocco 0 – personaggio intro
            { text: 'bentrovato malcapitato',                              img: 'scene2_1', isSprite: true  },
            { text: 'io sarò la tua guida lungo la tua storia',            img: 'scene2_1', isSprite: true  },
            { text: 'iniziamo dal principio...',                           img: 'scene2_1', isSprite: true  },
            // blocco 1-4 – storia narrativa
            { text: 'tanto tempo fa umani e mostri vivevano in pace',      img: 'scene2_2', isSprite: false },
            { text: 'le due razze erano separate da un confine stabilito', img: 'scene2_3', isSprite: false },
            { text: 'ma un giorno gli umani superarono questo confine',    img: 'scene2_4', isSprite: false },
            { text: "e crearono un grande caos all'interno del regno",     img: 'scene2_4', isSprite: false },
            { text: 'così i mostri risposero dichiarando guerra agli umani', img: 'scene2_4', isSprite: false },
            // blocco 5 – personaggio epilogo
            { text: "spetta a te portare l'ordine nel mondo",              img: 'scene2_5', isSprite: true  },
            { text: 'perché proprio tu?',                                  img: 'scene2_5', isSprite: true  },
            { text: 'perché nessun altro ha voglia di farlo!',             img: 'scene2_5', isSprite: true  },
            { text: 'e no io e te non ci conosciamo!',                     img: 'scene2_5', isSprite: true  },
            { text: 'ora premi invio per continuare',                      img: 'scene2_5', isSprite: true  },
        ];

        this.currentSlide  = 0;
        this.currentLetter = 0;
        this.typingEvent   = null;
        this.typingDone    = false;
        this.waitingEnter  = false;

        this.bgSprite       = null;
        this.imageDisplay   = null;
        this.portraitSprite = null;
        this.textBox        = null;
        this.textObj        = null;
        this.arrowObj       = null;
        this.enterKey       = null;

        this.W     = 800;
        this.H     = 600;
        this.IMG_H = 340;
        this.TYPING_MS = 35;
    }

    /* ───────────────────────────────────── create ─────────────────────────── */
    create() {
        const { W, H, IMG_H } = this;

        // ── sfondo spaziale animato (visibile nella zona testo) ───────────────
        this.bgSprite = this.add.sprite(0, 0, 'space_background_frame1')
            .setOrigin(0)
            .setScale(8)
            .setDepth(0);
        this.bgSprite.anims.play('skyanimation');

        // ── overlay scuro solo sulla zona testo ───────────────────────────────
        this.add.rectangle(W / 2, IMG_H + (H - IMG_H) / 2, W, H - IMG_H, 0x000000, 0.55)
            .setDepth(1);

        // ── immagine carousel: riempie tutta la metà superiore ────────────────
        this.imageDisplay = this.add.image(W / 2, IMG_H / 2, 'scene2_1')
            .setDisplaySize(W, IMG_H)
            .setDepth(2)
            .setOrigin(0.5);

        // ── ritratto sprite5 (centrato nella zona superiore, solo per isSprite) ──
        // Frame 344×384 → scala 0.85 ≈ 292×326px, ben visibile al centro
        this.portraitSprite = this.add.sprite(W / 2, IMG_H / 2, 'scene2_sprite5')
            .setScale(0.85)
            .setDepth(3)
            .setOrigin(0.5)
            .setVisible(false);

        // ── riquadro testo (metà inferiore) ───────────────────────────────────
        const textAreaTop = IMG_H + 10;
        const boxH        = H - IMG_H - 20;
        const boxY        = IMG_H + 10 + boxH / 2;

        this.textBox = this.add.rectangle(W / 2, boxY, W - 60, boxH, 0x000000, 0.75)
            .setStrokeStyle(2, 0xffffff, 0.6)
            .setDepth(4);

        this.textObj = this.add.text(50, textAreaTop + 14, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: W - 110 },
            lineSpacing: 10
        }).setDepth(5).setOrigin(0);

        // ── freccia ▼ ─────────────────────────────────────────────────────────
        this.arrowObj = this.add.text(W - 65, boxY + boxH / 2 - 22, '▼', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            color: '#ffff00'
        }).setDepth(5).setVisible(false);

        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                if (this.arrowObj.visible) {
                    this.arrowObj.setAlpha(this.arrowObj.alpha > 0 ? 0 : 1);
                }
            }
        });

        // ── input ─────────────────────────────────────────────────────────────
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // ── avvio prima slide ─────────────────────────────────────────────────
        this.showSlide(this.currentSlide);
    }

    /* ───────────────────────────────────── update ─────────────────────────── */
    update() {
        const justDown = Phaser.Input.Keyboard.JustDown(this.enterKey);

        if (!justDown) return;

        if (this.waitingEnter) {
            this.scene.start('Scene3');
            return;
        }

        if (!this.typingDone) {
            this.skipTyping();
            return;
        }

        this.nextSlide();
    }

    /* ─────────────────────────────── helpers ──────────────────────────────── */

    showSlide(idx) {
        const slide = this.SLIDES[idx];
        this.typingDone = false;
        this.currentLetter = 0;
        this.textObj.setText('');
        this.arrowObj.setVisible(false).setAlpha(1);

        this.updateImage(slide);
        this.startTyping(slide.text);
    }

    updateImage(slide) {
        if (slide.isSprite) {
            // Nascondi l'immagine statica, mostra e anima lo sprite
            this.imageDisplay.setVisible(false);
            this.portraitSprite.setVisible(true);
            this.portraitSprite.play('scene2_talk');
        } else {
            // Mostra l'immagine statica, nascondi lo sprite
            this.portraitSprite.setVisible(false);
            this.portraitSprite.stop();
            this.imageDisplay
                .setTexture(slide.img)
                .setDisplaySize(this.W, this.IMG_H)
                .setVisible(true);
        }
    }

    startTyping(fullText) {
        if (this.typingEvent) {
            this.typingEvent.remove(false);
        }

        this.currentLetter = 0;
        const isLast = this.currentSlide === this.SLIDES.length - 1;

        this.typingEvent = this.time.addEvent({
            delay: this.TYPING_MS,
            loop: true,
            callback: () => {
                if (this.currentLetter < fullText.length) {
                    this.textObj.setText(fullText.substring(0, this.currentLetter + 1));
                    this.currentLetter++;
                } else {
                    this.typingEvent.remove(false);
                    this.typingDone = true;
                    if (isLast) this.waitingEnter = true;
                    this.arrowObj.setVisible(true).setAlpha(1);
                }
            }
        });
    }

    skipTyping() {
        if (this.typingEvent) {
            this.typingEvent.remove(false);
        }
        const fullText = this.SLIDES[this.currentSlide].text;
        this.textObj.setText(fullText);
        this.typingDone = true;
        const isLast = this.currentSlide === this.SLIDES.length - 1;
        if (isLast) this.waitingEnter = true;
        this.arrowObj.setVisible(true).setAlpha(1);
    }

    nextSlide() {
        this.currentSlide++;
        if (this.currentSlide >= this.SLIDES.length) {
            this.scene.start('Scene3');
            return;
        }
        this.showSlide(this.currentSlide);
    }
}
