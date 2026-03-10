export default class Scene2 extends Phaser.Scene {

    constructor() {
        super('Scene2');

        this.worldwidth = 0;
        this.worldheight = 0;

        this.backgroud = null;

        this.secret_character = null;
        this.secret_character_x = 0;
        this.secret_character_y = 0;
        this.secret_character_talking_sound = null;
        this.secret_character_talking_text = [];
        this.secret_character_talking_obj = null;

        this.secret_character_talking_text_letter_index = 0;
        this.secret_character_talking_text_current = '';
        this.typing_event = null;
        this.current_text_index = 0;
        this.current_letter_index = 0;

        this.secret_character_talking_obj_x = 0;
        this.secret_character_talking_obj_y = 0;

        this.counter_floating_secret_character = 0;
        this.floating_ratio = 0;

        this.base_secret_character_y = 0;
        this.oscillation_amplitude = 0;
        this.oscillation_speed = 0;

        this.invio = null;
    }

    init() {
        this.worldwidth = 800;
        this.worldheight = 600;

        this.secret_character_x = this.worldwidth / 2;
        this.secret_character_y = this.worldheight / 5 * 3;

        this.secret_character_talking_text = [
            'bentrovato malcapitato',
            'io sarò la tua guida lungo la tua storia',
            'iniziamo dal principio...',
            'tanto tempo fa umani e mostri vivevano in pace',
            'le due razze erano separate da un confine stabilito',
            'ma un giorno un umano superò questo confine',
            'egli creò un grande caos all\'interno del regno',
            'cosi i mostri risposero dichiarando guerra agli umani',
            'spetta a te portare l\'ordine nel mondo',
            'perchè proprio tu?',
            'perchè nessun altro ha voglia di farlo!',
            'e no io e te non ci conosciamo!',
            'ora premi invio per continuare'
        ];

        this.secret_character_talking_obj_x = this.worldwidth / 6 * 1;
        this.secret_character_talking_obj_y = this.worldheight / 5 * 4;

        this.current_text_index = 0;
        this.current_letter_index = 0;
        this.secret_character_talking_text_current = '';
        this.secret_character_talking_text_letter_index = 0;

        this.floating_ratio = 5;
        this.counter_floating_secret_character = 0;

        this.base_secret_character_y = this.secret_character_y;
        this.oscillation_amplitude = 10;   // pixel di escursione
        this.oscillation_speed = 0.002;    // velocità oscillazione
    }

    create() {
        this.backgroud = this.add.sprite(0, 50, 'space_background_frame1').setDepth(1).setScale(8).setOrigin(0);

        this.backgroud.anims.play('skyanimation');

        this.secret_character = this.add.sprite(this.secret_character_x, this.secret_character_y, 'secret_character').setDepth(2).setScale(7);

        this.secret_character_talking_obj = this.add.text(this.secret_character_talking_obj_x, this.secret_character_talking_obj_y, '', {
            fontFamily: '"Press Start 2P",monospace',
            fontSize: '18px',
            color: '#ffff00',
            wordWrap: { width: 600 }
        }).setDepth(5).setOrigin(0);

        this.start_typing();

        this.invio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update(time) {
        this.secret_character.y =
            this.base_secret_character_y +
            this.oscillation_amplitude *
            Math.sin(time * this.oscillation_speed);

        if (this.invio.isDown) {
            this.scene.start('Scene3');
        }
    }

    start_typing() {
        this.typing_event = this.time.addEvent({
            delay: 40,
            callback: () => {
                const fullText = this.secret_character_talking_text[this.current_text_index];

                this.secret_character_talking_text_current += fullText[this.current_letter_index];

                this.secret_character_talking_obj.setText(this.secret_character_talking_text_current);

                this.current_letter_index++;

                if (this.current_letter_index >= fullText.length) {
                    this.typing_event.remove();

                    this.time.delayedCall(1000, () => {
                        this.current_text_index++;

                        if (this.current_text_index < this.secret_character_talking_text.length) {
                            this.secret_character_talking_text_current = '';
                            this.current_letter_index = 0;
                            this.start_typing();
                        }
                    });
                }
            },
            loop: true
        });
    }

}




