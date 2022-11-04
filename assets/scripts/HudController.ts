import { _decorator, Component, Node, Button, Label, JsonAsset } from 'cc';
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

    start() {
        this.addListenerToHit();
        eventTarget.addEventListener(CUSTOM_EVENT.LEVEL_COMP, () => {
            this.onLevelComplete();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.BREAK_CUBE, () => {
            this.updateScore();
        });
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
        this.scoreLabel.string = 'Score : ' + this.current_score;
    }

    onLevelComplete() {

        let data = JSON.parse(localStorage.getItem(storageName));
        if (this.current_score > this.high_score) {
            data.highScore = this.current_score;
        }
    }

    updateLevelMeter() {
        // todo next
    }
}

