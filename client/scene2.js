/**
 * Scene2 – Cutscene di introduzione stile Undertale
 *
 * Struttura dei blocchi:
 *  blocco 0 → testi 0-2  → sprite5 (personaggio parlante animato)
 *  blocco 1 → testo  3   → immagine 1   (umani e mostri in pace)
 *  blocco 2 → testo  4   → immagine 2   (confine tra le razze)
 *  blocco 3 → testi 5-6  → immagine 3   (gli umani superano il confine)
 *  blocco 4 → testo  7   → immagine 4   (i mostri dichiarano guerra)
 *  blocco 5 → testi 8-12 → sprite5      (il personaggio torna a parlare)
 */
export default class Scene2 extends Phaser.Scene {

    constructor() {
        super('Scene2');

        // ── testi e mappa verso immagini ──────────────────────────────────────
        this.SLIDES = [
            // [textIndex, imageKey, isSprite]
            // blocco 0: sprite5 parlante
            { text: 'bentrovato malcapitato',                           img: 'scene2_sprite5', isSprite: true },
            { text: 'io sarò la tua guida lungo la tua storia',         img: 'scene2_sprite5', isSprite: true },
            { text: 'iniziamo dal principio...',                        img: 'scene2_sprite5', isSprite: true },
            // blocco 1-4: immagini narrative
            { text: 'tanto tempo fa umani e mostri vivevano in pace',   img: 'scene2_img1',    isSprite: false },
            { text: 'le due razze erano separate da un confine stabilito', img: 'scene2_img2', isSprite: false },
            { text: 'ma un giorno gli umani superarono questo confine', img: 'scene2_img3',    isSprite: false },
            { text: "e crearono un grande caos all'interno del regno",  img: 'scene2_img3',    isSprite: false },
            { text: 'così i mostri risposero dichiarando guerra agli umani', img: 'scene2_img4', isSprite: false },
            // blocco 5: sprite5 torna a parlare
            { text: "spetta a te portare l'ordine nel mondo",           img: 'scene2_sprite5', isSprite: true },
            { text: 'perché proprio tu?',                               img: 'scene2_sprite5', isSprite: true },
            { text: 'perché nessun altro ha voglia di farlo!',          img: 'scene2_sprite5', isSprite: true },
            { text: 'e no io e te non ci conosciamo!',                  img: 'scene2_sprite5', isSprite: true },
            { text: 'ora premi invio per continuare',                   img: 'scene2_sprite5', isSprite: true },
        ];

        this.currentSlide   = 0;   // indice nel SLIDES array
        this.currentLetter  = 0;   // indice carattere nel testo corrente
        this.typingEvent    = null;
        this.typingDone     = false;
        this.waitingEnter   = false;// indica se siamo all'ultimo slide → aspetta premuto invio

        // oggetti di display
        this.bgSprite       = null; // sfondo spaziale animato
        this.imageDisplay   = null; // immagine / spritesheet corrente
        this.textBox        = null; // rettangolo sfondo testo
        this.textObj        = null; // oggetto testo
        this.arrowObj       = null; // ▼ lampeggiante che indica "premi invio"

        this.enterKey       = null;
        this.enterJustDown  = false;

        // dimensioni canvas
        this.W = 800;
        this.H = 600;

        // costanti layout
        this.IMG_Y      = 160;  // centro-y immagine
        this.IMG_SCALE  = 5;    // scala immagine statica
        this.SP5_SCALE  = 10;   // scala spritesheet parlante
        this.TEXT_Y     = 360;  // top area testo (lascia spazio per l'immagine)
        this.TYPING_MS  = 35;   // ms per lettera
    }

    /* ───────────────────────────────────── create ─────────────────────────── */
    create() {
        const { W, H } = this;

        // ── sfondo animato (stelle che scorrono) ──────────────────────────────
        this.bgSprite = this.add.sprite(0, 0, 'space_background_frame1')
            .setOrigin(0)
            .setScale(8)
            .setDepth(0);
        this.bgSprite.anims.play('skyanimation');

        // ── overlay scuro per leggibilità testo ──────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.35).setDepth(1);

        // ── cornice immagine (in alto, centrata) ─────────────────────────────
        const frameSize = 240;
        this.add.rectangle(W / 2, this.IMG_Y, frameSize + 12, frameSize + 12, 0xffffff, 0.12)
            .setDepth(2);

        // ── imageDisplay (placeholder – viene aggiornato per ogni slide) ──────
        this.imageDisplay = this.add.image(W / 2, this.IMG_Y, 'scene2_sprite5')
            .setDepth(3)
            .setScale(this.SP5_SCALE)
            .setOrigin(0.5);



        // ── riquadro testo ─────────────────────────────────────────────────────
        const boxH = 180;
        const boxY = this.TEXT_Y + boxH / 2 - 10;
        this.textBox = this.add.rectangle(W / 2, boxY, W - 60, boxH, 0x000000, 0.75)
            .setStrokeStyle(2, 0xffffff, 0.6)
            .setDepth(4);

        this.textObj = this.add.text(50, this.TEXT_Y, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#ffffff',
            wordWrap: { width: W - 100 },
            lineSpacing: 8
        }).setDepth(5).setOrigin(0);

        // ── freccia ▼ "premi invio" ───────────────────────────────────────────
        this.arrowObj = this.add.text(W - 60, boxY + boxH / 2 - 18, '▼', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#ffff00'
        }).setDepth(5).setVisible(false);

        // effetto lampeggio freccia
        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                if (this.arrowObj.visible) {
                    this.arrowObj.setVisible(!this.arrowObj.alpha);
                    // toggle alpha invece di toggle visible per non perdere il riferimento
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
            // ultima slide → vai a Scene3
            this.scene.start('Scene3');
            return;
        }

        if (!this.typingDone) {
            // skip typing: mostra subito tutto il testo
            this.skipTyping();
            return;
        }

        // avanza alla prossimo slide
        this.nextSlide();
    }

    /* ─────────────────────────────── helpers ──────────────────────────────── */

    showSlide(idx) {
        const slide = this.SLIDES[idx];
        this.typingDone = false;
        this.currentLetter = 0;
        this.textObj.setText('');
        this.arrowObj.setVisible(false).setAlpha(1);

        // aggiorna immagine visualizzata
        this.updateImage(slide);

        // tipo di testo
        this.startTyping(slide.text);
    }

    updateImage(slide) {
        const tex = this.textures.get(slide.img);
        const src = tex.getSourceImage();
        if (slide.isSprite) {
            this.imageDisplay.setTexture('scene2_sprite5');
            const maxSide = 230;
            if (src && src.width > 0) {
                const ratio = Math.min(maxSide / src.width, maxSide / src.height);
                this.imageDisplay.setScale(ratio);
            } else {
                this.imageDisplay.setScale(this.SP5_SCALE);
            }
        } else {
            this.imageDisplay.setTexture(slide.img);
            const maxSide = 230;
            if (src && src.width > 0) {
                const ratio = Math.min(maxSide / src.width, maxSide / src.height);
                this.imageDisplay.setScale(ratio);
            } else {
                this.imageDisplay.setScale(this.IMG_SCALE);
            }
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
                    if (isLast) {
                        this.waitingEnter = true;
                    }
                    // mostra freccia
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
