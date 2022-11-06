import { _decorator, Component, Node, Button, Label, JsonAsset, tween, Vec3, Tween, easing } from 'cc';
import { IEventDump } from '../../@types/packages/scene/@types/public';
import { CUSTOM_EVENT, eventTarget, storageName } from './MainScene';
const { ccclass, property } = _decorator;

const scoreMultiplier = 5;

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

    onLoad() {
        let dist = 135;
        for (let index = 0; index < this.menu.children.length; index++) {
            const element = this.menu.children[index];
            element.setPosition(new Vec3(0, (index + 10) * -dist, 0));
        }
        this.hideHud();
        this.logo.active = true;
        this.scoreLabel.string = ' Score : ' + this.current_score + ' ';
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
        eventTarget.addEventListener(CUSTOM_EVENT.LEVEL_COMP, () => {
            this.onLevelComplete();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.BREAK_CUBE, () => {
            this.updateScore();
        });

        this.showMenuButtons();
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
        if (this.current_score > this.high_score) {
            data.highScore = this.current_score;
        }
    }

    onPlayClick() {
        this.hideMenuButtons();
        this.hideLogo();

    }

    onResumeClick() {
        this.hideMenuButtons();
        this.hideLogo();
    }

    onQuitClick() {
        this.hideMenuButtons();
        this.hideLogo();
    }
}

