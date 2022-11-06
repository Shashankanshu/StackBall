import { _decorator, Component, ICollisionEvent, macro, SphereCollider } from 'cc';
import { MainScene } from './MainScene';
const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    lastCollider = "";
    cy = 0;   //currrent y position
    vy = 0;   //velocity
    mvy = 5;  //max velocity
    // delta = 0.01;
    gravity = 0.2;
    collision = false;

    private _mainScene: MainScene;

    public set mainScene(v: MainScene) {
        this._mainScene = v;
    }

    public get mainScene(): MainScene {
        return this._mainScene;
    }

    initBall() {
        this.cy = this.node.position.y;
        // this.schedule(this.fixedUpdate, 1 / 120, macro.REPEAT_FOREVER, 0);
        let collider = this.node.getComponent(SphereCollider);
        collider.on('onTriggerEnter', this.onCollision, this);
        // collider.on('onTriggerStay', this.onCollisionStay, this);
    }

    update(dt: number) {

        if (this.mainScene.game_started) {

            if (!this.mainScene.game_over) {

                if (this.collision && (!this.mainScene.hit_pressed || this.mainScene.levelOver)) { // ball is on surface
                    this.vy = -this.vy;
                    this.collision = false;
                }
                this.cy -= this.vy * dt;
                // this.cy -= this.vy * this.delta;
                this.node.setPosition(this.node.position.x, this.cy, this.node.position.z);

                if (this.vy <= this.mvy)
                    this.vy += this.gravity;
            }
        }
    }

    onCollision(event: ICollisionEvent) {
        this.collision = true;
        this.mainScene.onBallCollision(event);
    }

    onCollisionStay(event: ICollisionEvent) {
        console.log('onCollisionStay');

        this.collision = true;
        // this.mainScene.onBallCollision(event);
    }
}

// if (this.lastCollider != event.otherCollider.node.parent.uuid) {

// console.log('Collison Occured', event.otherCollider.node.parent.uuid);

// let rigidBody = this.getComponent(RigidBody);
// rigidBody.applyImpulse(new math.Vec3(0, 4, 0));

// this.lastCollider = event.otherCollider.node.parent.uuid;
// }

// this.collision = true;

// if (!this.mainScene.hit_pressed) {

//     let rigidBody = this.getComponent(RigidBody);
//     rigidBody.applyImpulse(new math.Vec3(0, 4, 0));
//     this.lastCollider = event.otherCollider.node.parent.uuid;

// }