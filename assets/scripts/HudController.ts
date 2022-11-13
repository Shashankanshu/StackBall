import { _decorator, Component, Node, Label, tween, Vec3, easing, AudioSource, AudioClip, Sprite, Color, UIOpacity } from 'cc';
import { AudioEngine } from './AudioEngine';
import { CUSTOM_EVENT, eventTarget } from './MainScene';
import { ADS_TYPE, AUDIO_TYPE, BOOST_TIME, REWARD, SCOREMULTIPLIER, STORAGENAME } from './StackCont';
const { ccclass, property } = _decorator;

@ccclass('HudController')
export class HudController extends Component {

    current_score = 0;
    current_level = 1;
    high_score = 0;

    @property(Node)
    hitButton: Node = null;

    @property(Node)
    requestAdsContainer: Node = null;

    @property(Label)
    adsReqLabel: Label = null;

    @property(Label)
    scoreLabel: Label = null;

    @property(Label)
    levelInfo: Label = null;

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

    @property(Node)
    settings: Node = null;

    @property(Node)
    overlay: Node = null;

    isSoundOn = true;

    @property([AudioClip])
    audioClip: AudioClip[] = [];

    delayBetMenu = 0.5;
    musicVolume = 0.2;
    playClicked = false;
    isGamePaused = false;

    transparency = 121;
    requestedAdsType: ADS_TYPE = ADS_TYPE.BOOST;

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
        this.isGamePaused = false;

        this.requestAdsContainer.active = true;
        this.requestAdsContainer.setScale(new Vec3(0, 0, 0));

        this.hideHud();
        this.hideCreds();
        this.showOverlay();

        this.logo.active = true;
        this.scoreLabel.string = ' Score : ' + this.current_score + ' ';

        AudioEngine.instance.init(this.getComponent(AudioSource));
        AudioEngine.instance.playMusic(true);
        AudioEngine.instance.setMusicVolume(this.musicVolume);
    }

    private resetScore() {

        let data = JSON.parse(localStorage.getItem(STORAGENAME));

        this.current_score = data.score;
        this.scoreLabel.string = ' Score : ' + this.current_score + ' ';

        this.current_level = data.level;
        this.levelInfo.string = ' level : ' + (this.current_level + 1) + ' ';
    }

    showHud() {
        this.scoreLabel.node.active = true;
        this.meter.active = true;
        this.logo.active = true;
        this.settings.active = true;
        this.levelInfo.node.active = true;
    }

    hideHud() {
        this.scoreLabel.node.active = false;
        this.meter.active = false;
        this.logo.active = false;
        this.settings.active = false;
        this.levelInfo.node.active = false;
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
            this.showLifeRequest();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.NEW_GAME, () => {
            this.resetScore();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.ADS_SHOWN, () => {
            this.onAdsShown();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.ADS_NOT_SHOWN, () => {
            this.onAdsNotShown();
        });
    }

    showOverlay() {
        let element = this.overlay.getComponent(UIOpacity);
        tween(element)
            .to(0.1, { opacity: this.transparency }, {
                easing: easing.sineOut
            })
            .start();
    }

    hideOverlay() {
        let element = this.overlay.getComponent(UIOpacity);
        tween(element)
            .to(0.1, { opacity: 0 }, {
                easing: easing.sineOut
            })
            .start();
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
                    easing: easing.sineIn,
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
        this.current_score += SCOREMULTIPLIER;
        this.scoreLabel.string = ' Score : ' + this.current_score + ' ';
    }

    onLevelComplete() {
        let data = JSON.parse(localStorage.getItem(STORAGENAME));
        let gameData = {
            level: data.level,
            score: this.current_score
        };
        localStorage.setItem(STORAGENAME, JSON.stringify(gameData));
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.LEVEL_PASS]);
    }

    onPlayClick() {
        AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);
        this.playClicked = true;
        this.hideMenuButtons();
        this.hideLogo();
        this.hideOverlay();
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.NEW_GAME));
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.PLAY_GAME));

        this.showBoostRequest();
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

        if (this.playClicked) {

            this.hideOverlay();
            this.scheduleOnce(() => {
                this.isGamePaused = false;
                eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.GAME_RESUME));
            }, 0.5);

        } else {

            this.scheduleOnce(this.showMenuButtons, this.delayBetMenu);
        }
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

    onSettingsClick() {
        if (!this.isGamePaused) {
            this.isGamePaused = true;
            this.showOptions();
            this.showOverlay();
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.GAME_PAUSED));
            AudioEngine.instance.playSound(this.audioClip[AUDIO_TYPE.CLICK]);
        }
    }

    /// ads work

    requestAds() {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.WATCH_ADS));
    }

    showBoostRequest() {
        this.isGamePaused = true;
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.GAME_PAUSED));
        this.adsReqLabel.string = REWARD.boost + 'for ' + BOOST_TIME + ' sec';
        this.requestedAdsType = ADS_TYPE.BOOST;
        this.showRequestAdsPopup();
    }

    showLifeRequest() {
        this.isGamePaused = true;
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.GAME_PAUSED));
        this.adsReqLabel.string = REWARD.life;
        this.requestedAdsType = ADS_TYPE.LIFE;
        this.showRequestAdsPopup();
    }

    onNoClick() {
        this.resumeGame();
    }

    resumeGame() {
        this.isGamePaused = false;
        this.hideRequestAdsPopup();

        if (this.requestedAdsType === ADS_TYPE.LIFE) {
            this.scheduleOnce(() => {
                eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.GAME_RESUME));
            }, 0.2);
        }
        else {
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.GAME_RESUME));
        }
    }

    onAdsShown() {
        this.hideRequestAdsPopup();
        if (this.requestedAdsType === ADS_TYPE.BOOST)
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.REWARD_BOOST));
        else {
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.REWARD_LIFE));
        }
    }

    onAdsNotShown() {
        this.hideRequestAdsPopup();
        this.isGamePaused = false;
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.GAME_RESUME));
    }

    showRequestAdsPopup() {
        tween(this.requestAdsContainer)
            .to(0.2, { scale: new Vec3(1, 1, 1) }, {
                easing: easing.sineOut
            }).start();
    }

    hideRequestAdsPopup() {
        tween(this.requestAdsContainer)
            .to(0.2, { scale: new Vec3(0, 0, 0) }, {
                easing: easing.sineOut
            }).start();
    }
}

