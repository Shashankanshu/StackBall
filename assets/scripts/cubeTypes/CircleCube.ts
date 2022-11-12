import { _decorator, Node, ICollisionEvent, MeshCollider, Vec3, Vec2, tween, easing } from 'cc';
import { CUSTOM_EVENT, eventTarget } from '../MainScene';
import { BaseCube } from './BaseCube';
const { ccclass, property } = _decorator;

@ccclass('CircleCube')
export class CircleCube extends BaseCube {

    isBroken = false

    @property([Node])
    surfaceArr: Node[] = [];

    breakPositionArray = [
        new Vec2(7.377, 1.687),
        new Vec2(1.15, -7.887),
        new Vec2(-8.544, -1.999),
        new Vec2(-2.536, 7.739)
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