import { _decorator, Component, Node, Vec3, game, director, clamp } from 'cc';
import { MainScene } from './MainScene';
const { ccclass, property } = _decorator;

@ccclass('GameCamera')
export class GameCamera extends Component {

    @property({ type: Node })
    ball: Node;

    smoothFollow = true;
    moveSmooth = 0.2;

    offSet = 2;
    ballLastPosY = 0;
    gameOver = false;

    initCamera() {
        this.node.position.set(0, this.ball.position.y, 0);
    }

    lateUpdate(dt) {

        if (!this.gameOver) {

            if (this.ball.position.y < this.node.position.y) {
                let tempPos = new Vec3();
                tempPos = new Vec3(0, this.ball.position.y, 0);
                this.node.position = this.node.position.lerp(tempPos, this.moveSmooth);
            }
        } else {

            if (this.ball.position.y > this.node.position.y) {
                let tempPos = new Vec3();
                tempPos = new Vec3(0, this.ball.position.y, 0);
                this.node.position = this.node.position.lerp(tempPos, this.moveSmooth);
            }
        }
    }

    // update(deltaTime: number) {

    // }
}

