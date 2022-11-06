import { _decorator, Component, Node, Label, tween, Vec3, easing, AudioSource, AudioClip } from 'cc';
import { AudioEngine } from './AudioEngine';
import { CUSTOM_EVENT, eventTarget, storageName } from './MainScene';
const { ccclass, property } = _decorator;

const scoreMultiplier = 5;

export const enum AUDIO_TYPE {
    BUTTON,
    CLICK,
    IMMOTAL_CUBE,
    JUMP,
    NORMAL_CUBE,
    LEVEL_PASS,
    PLAYER_DEAD,
    POP
};

@ccclass('HudController')
export class HudController extends Component {

    current_score = 0;
    high_score = 0;

    @property(Node)
    hitButton: Node = null;

    @property(Label)
    scoreLabel: Label = null;

    @property(Node)
    menu: Node = null;

    @property(Node)
    logo: Node = null;

    @property(Node)
    meter: Node = null;

    @property(Node)
    soundOnSprite: Node = null;

    @property(Node)
    soundOffSprite: Node = null;

    @property(Node)
    options: Node = null;

    @property(Node)
    creds: Node = null;

    isSoundOn = true;

    @property([AudioClip])
    audioClip: AudioClip[] = [];

    delayBetMenu = 0.5;
    musicVolume = 0.2;

    onLoad() {

        let dist = 135;

        for (let index = 0; index < this.menu.children.length; index++) {
            const element = this.menu.children[index];
            element.setPosition(new Vec3(0, (index + 10) * -dist, 0));
        }

        for (let index = 0; index < this.options.children.length; index++) {
            let element = this.options.children[index];
            element.setPosition(new Vec3(0, (index + 10) * -dist, 0));
            // element.setPosition(new Vec3(0, dist - (index * dist), 0));
        }

        this.soundOnSprite.active = true;
        this.soundOffSprite.active = false;

        this.hideHud();

        this.logo.active = true;
        this.scoreLabel.string = ' Score : ' + this.current_score + ' ';

        AudioEngine.instance.init(this.getComponent(AudioSource));
        AudioEngine.instance.playMusic(true);
        AudioEngine.instance.setMusicVolume(this.musicVolume);
    }

    showHud() {
        this.scoreLabel.node.active = true;
        this.meter.active = true;
        this.logo.active = true;
    }

    hideHud() {
        this.scoreLabel.node.active = false;
        this.meter.active = false;
        this.logo.active = false;
    }

    start() {
        this.addListenerToHit();
        this.addEventListeners();
        this.showMenuButtons();
    }

    addEventListeners() {
        eventTarget.addEventListener(CUSTOM_EVENT.LEVEL_COMP, () => {
            this.onLevelComplete();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.BREAK_CUBE, () => {
            this.updateScore();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.BALL_COLLIDE, () => {
            AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.POP]);
        });
        eventTarget.addEventListener(CUSTOM_EVENT.HARD_CUBE, () => {
            AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.IMMOTAL_CUBE]);
        });
        eventTarget.addEventListener(CUSTOM_EVENT.PLAYER_DEAD, () => {
            AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.PLAYER_DEAD]);
        });
    }

    showMenuButtons() {
        let dist = 135;
        let index = 0;

        this.schedule(() => {

            let element = this.menu.children[index];
            tween(element)
                .to(0.5, { position: new Vec3(0, -index * dist, 0) }, {
                    easing: easing.sineOut
                })
                .start();
            ++index;

        }, 0.1, 2, 0);
    }

    hideMenuButtons() {
        let dist = 135;
        let index = 2;
        this.schedule(() => {

            let element = this.menu.children[index];
            tween(element)
                .to(0.5, { position: new Vec3(0, -(index + 10) * dist, 0) }, {
                    easing: easing.sineIn
                })
                .start();
            --index;

        }, 0.05, 2, 0);
    }

    showOptions() {
        let dist = 135;
        let index = 0;

        this.schedule(() => {

            let element = this.options.children[index];
            tween(element)
                .to(0.5, { position: new Vec3(0, dist - (index * dist)) }, {
                    easing: easing.sineOut
                })
                .start();
            ++index;

        }, 0.1, 2, 0);
    }

    hideOptions() {
        let dist = 135;
        let index = 2;

        this.schedule(() => {

            let element = this.options.children[index];
            tween(element)
                .to(0.5, { position: new Vec3(0, -(index + 10) * dist, 0) }, {
                    easing: easing.sineIn
                })
                .start();
            --index;

        }, 0.05, 2, 0);
    }

    showCreds() {
        this.creds.active = true;
    }
    hideCreds() {
        this.creds.active = false;
    }

    hideLogo() {
        tween(this.logo)
            .to(0.5, { position: new Vec3(0, 1000, 0) }, {
                easing: easing.backIn,
                onComplete: () => {
                    this.showHud();
                }
            })
            .start();
    }

    addListenerToHit() {

        this.hitButton.on(Node.EventType.TOUCH_START, (event) => {
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.HIT_PRESS));
        });

        this.hitButton.on(Node.EventType.TOUCH_END, (event) => {
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.HIT_RELEASE));
        });

    }

    updateScore() {
        this.current_score += scoreMultiplier;
        this.scoreLabel.string = ' Score : ' + this.current_score + ' ';
    }

    onLevelComplete() {
        let data = JSON.parse(localStorage.getItem(storageName));
        let gameData = {
            level: data.level,
            score: this.current_score
        };
        localStorage.setItem(storageName, JSON.stringify(gameData));
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.LEVEL_PASS]);
    }

    onPlayClick() {
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);

        this.hideMenuButtons();
        this.hideLogo();
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.PLAY_GAME));
    }

    onOptionsClick() {
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);

        this.hideMenuButtons();
        this.hideMenuButtons();
        this.scheduleOnce(this.showOptions, this.delayBetMenu);
    }

    onExitOptionsClick() {
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);

        this.hideOptions();
        this.scheduleOnce(this.showMenuButtons, this.delayBetMenu);
    }

    onCreditsClick() {
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);

        this.hideOptions();
        this.scheduleOnce(this.showCreds, this.delayBetMenu);
    }

    onExitCredsClick() {
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);

        this.hideCreds();
        this.showOptions();
    }

    onSoundClick() {
        this.isSoundOn = !this.isSoundOn;

        if (this.isSoundOn) {
            this.soundOnSprite.active = true;
            this.soundOffSprite.active = false;
            AudioEngine.instance.setMusicVolume(this.musicVolume);
        } else {
            this.soundOnSprite.active = false;
            this.soundOffSprite.active = true;
            AudioEngine.instance.setMusicVolume(0);
        }

        AudioEngine.instance.muteSound(!this.isSoundOn);
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);
    }

    onQuitClick() {
        // this.hideMenuButtons();
        // this.hideLogo();
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.QUIT_GAME));
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);
    }
}

