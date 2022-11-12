import { _decorator, Component, Node, Vec2, MeshCollider, tween, Vec3, easing, ICollisionEvent } from 'cc';
import { CUSTOM_EVENT, eventTarget } from '../MainScene';
import { BaseCube } from './BaseCube';
const { ccclass, property } = _decorator;

@ccclass('FlowerCube')
export class FlowerCube extends BaseCube {
    isBroken = false

    @property([Node])
    surfaceArr: Node[] = [];

    breakPositionArray = [
        new Vec2(0.084, -0.084),
        new Vec2(-0.084, -0.084),
        new Vec2(-0.084, 0.084),
        new Vec2(0.084, 0.084)
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