import { _decorator, Component, Node, Vec2, MeshCollider, tween, Vec3, easing, ICollisionEvent } from 'cc';
import { CUSTOM_EVENT, eventTarget } from '../MainScene';
import { BaseCube } from './BaseCube';
const { ccclass, property } = _decorator;

@ccclass('SpikeCube')
export class SpikeCube extends BaseCube {
    isBroken = false

    @property([Node])
    surfaceArr: Node[] = [];

    breakPositionArray = [
        new Vec2(0.117, -0.073),
        new Vec2(-0.075, -0.119),
        new Vec2(-0.126, 0.075),
        new Vec2(0.076, 0.114)
    ];

    start() {
        this.isBroken = false;
    }

    break() {
        this.isBroken = true;

        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.BREAK_CUBE));

        for (let index = 0; index < this.surfaceArr.length; index++) {
            const element = this.surfaceArr[index];
            element.getComponent(MeshCollider).enabled = false;

            // if (element.name === event.selfCollider.node.name) {
            tween(element)
                .to(0.1,
                    { position: new Vec3(this.breakPositionArray[index].x, 0, this.breakPositionArray[index].y) },
                    { easing: easing.linear, })
                .call((e) => {
                    // console.log(e);
                    this.node.active = false;
                })
                .start();
            // }

        }
    }

    onCollision(event: ICollisionEvent) {

        if (this._mainScene.hit_pressed) {
            this.node.active = false;
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.BREAK_CUBE));
        }
    }
}

