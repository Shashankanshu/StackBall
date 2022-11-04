import { _decorator, Component, Node, Collider, ICollisionEvent, RigidBody, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    lastCollider = "";

    start() {

        // this.node.position.set(0, 50, 0);

        let collider = this.node.getComponent(Collider);
        collider.on('onCollisionEnter', this.onCollision, this);
    }

    onCollision(event: ICollisionEvent) {

        // if (this.lastCollider != event.otherCollider.node.parent.uuid) {

            // console.log('Collison Occured', event.otherCollider.node.parent.uuid);

            let rigidBody = this.getComponent(RigidBody);
            rigidBody.applyImpulse(new math.Vec3(0, 4, 0));

            this.lastCollider = event.otherCollider.node.parent.uuid;
        // }


    }
}

