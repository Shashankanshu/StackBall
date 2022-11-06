import { _decorator, Component, Node, Collider, ICollisionEvent, MeshCollider, Vec3, Vec2, tween, easing } from 'cc';
import { CUSTOM_EVENT, eventTarget } from '../MainScene';
import { BaseCube } from './BaseCube';
const { ccclass, property } = _decorator;

@ccclass('SixCube')
export class SixCube extends BaseCube {

    isBroken = false

    @property([Node])
    surfaceArr: Node[] = [];

    breakPositionArray = [
        new Vec2(0.02, -0.014),
        new Vec2(0, -0.025),
        new Vec2(-0.022, -0.013),
        new Vec2(-0.026, 0.015),
        new Vec2(0, 0.026),
        new Vec2(0.023, 0.014)
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

        // let surfaceName = event.selfCollider.node.name;
        // if (surfaceName[surfaceName.length - 1] === "1") {

        // } else {

        // }

        if (this._mainScene.hit_pressed) {
            this.node.active = false;
            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.BREAK_CUBE));
        }


        // this.break(event);

    }

    update(deltaTime: number) {

    }
}

