import { Component, Label, tween, Node, _decorator, Vec3, easing } from 'cc';
import { native } from 'cc'
import { CUSTOM_EVENT, eventTarget } from './MainScene';
import { adsMsg, Constants } from './StackCont';

const { ccclass, property } = _decorator;

@ccclass('WatchAd')
export class WatchAd extends Component {

    @property(Label)
    popupLabel: Label = null;

    @property(Node)
    adsContainer: Node;

    onLoad() {
        this.adsContainer.active = true;
        this.adsContainer.setScale(new Vec3(0, 0, 0));
        this.initEventListeners();
        
        if (native.jsbBridgeWrapper) {
            native.jsbBridgeWrapper.addNativeEventListener("adsCallback", (msg) => {
                this.javaCallback(msg);
            });
        }
    }

    initEventListeners() {
        eventTarget.addEventListener(CUSTOM_EVENT.WATCH_ADS, () => {
            this.onWatchAd();
        });
    }

    setMessage(txt: string) {
        this.popupLabel.string = txt;
    }

    onWatchAd() {

        //play audio
        if (Constants.isProd) {
            if (native.reflection) {
                native.reflection.callStaticMethod("com/cocos/game/Test", "hello", "(Ljava/lang/String;)V", "this is a message from JavaScript");
            }
        } else {
            this.afterWatchingAds();
        }
    }

    javaCallback(msg) {

        if (msg == "Earned") {
            this.afterWatchingAds();

        } else if (msg == "Failed" || msg == "NotLoaded") {

            this.setMessage(adsMsg[msg]);
            this.showPopup();
        }
    }

    afterWatchingAds() {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.ADS_SHOWN));
    }

    showPopup() {
        tween(this.adsContainer)
            .to(0.1, { scale: new Vec3(1, 1, 1) }, {
                easing: easing.sineOut
            }).start();
    }

    hidePopup() {
        tween(this.adsContainer)
            .to(0.1, { scale: new Vec3(0, 0, 0) }, {
                easing: easing.sineOut
            }).start();
    }

    onExit() {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.ADS_NOT_SHOWN));
        this.hidePopup();
    }

    onRetry() {
        this.hidePopup();
        this.onWatchAd();
    }
}