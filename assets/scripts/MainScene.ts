import { _decorator, Component, Node, PhysicsSystem, JsonAsset, Prefab, instantiate, Vec2, Vec3, Animation, Sprite, UITransform, tween, macro, ICollisionEvent, Tween, Color, game, debug, profiler } from 'cc';
import { Ball } from './Ball';
import { GameCamera } from './Camera';
import { BaseCube } from './cubeTypes/BaseCube';
const { ccclass, property } = _decorator;

export const storageName = 'rajgamesdata';
export const eventTarget = new EventTarget();

export const enum CUSTOM_EVENT {
    HIT_PRESS = 'onhitpress',
    HIT_RELEASE = 'onhitrelease',
    BREAK_CUBE = 'breakcube',
    LEVEL_COMP = 'levelcomplete'
}

export const enum CUBE_TYPES {
    SIX_CUBE,
    FLOWER,
    SPIKE,
    SQUARE
};

@ccclass('MainScene')
export class MainScene extends Component {

    @property(JsonAsset)
    gameConfig: JsonAsset;

    @property([Prefab])
    cubesPrefab: Prefab[] = [];

    @property(Node)
    cubeStack: Node;

    @property(Node)
    filler: Node = null;

    @property(Node)
    ball: Node;

    @property(Node)
    camera: GameCamera;

    savedConfig: {
        level: number,
        score: number
    }

    spinDir = {
        right: false,
        left: false
    }

    fillerDimention: UITransform;

    max_level = 0;
    current_level = 0;
    hit_pressed = false;

    game_started = false;
    game_over = false;

    level_data = null;

    fillTween: Tween<Node>;
    emptyTween: Tween<Node>;

    colorRed: Color;
    colorGreen: Color;

    boostActive = false;

    onLoad() {

        game.frameRate = 60;
        profiler.hideStats();

        this.fillerDimention = this.filler.getComponent(UITransform);
        this.colorRed = new Color().fromHEX('#ff0000');
        this.colorGreen = new Color().fromHEX('#00ff00');
    }

    resetComponents() {
        this.filler.getComponent(Sprite).color = this.colorGreen;
        this.filler.setPosition(new Vec3(0, -this.fillerDimention.height, 0));
    }

    start() {
        this.resetComponents();

        PhysicsSystem.instance.enable = true;
        this.initConfigData();

        let data = this.gameConfig.json;
        this.max_level = data['levels'].length;

        let lData = data['levels'][this.savedConfig.level];
        this.level_data = lData;

        this.createLevel(lData, data);

        this.initEventListeners();
        this.spinAxel();

        (this.ball.getComponent('Ball') as Ball).mainScene = this;

        let bPos = this.cubeStack.children[this.cubeStack.children.length - 1].position.y + 5;
        this.ball.setPosition(new Vec3(this.ball.position.x, bPos, this.ball.position.z));

        (this.ball.getComponent('Ball') as Ball).initBall();

        let camera = this.camera.getComponent('GameCamera') as GameCamera;
        camera.initCamera();

        this.game_started = true;
    }

    initConfigData() {

        this.savedConfig = {
            level: 0,
            score: 0
        };

        let gameData = JSON.parse(localStorage.getItem(storageName));
        if (gameData == null || gameData == undefined) {
            gameData = {
                level: 0,
                score: 0
            };
            localStorage.setItem(storageName, JSON.stringify(gameData));
        }

        this.savedConfig.level = gameData.level;
        this.savedConfig.score = gameData.score;
        this.current_level = gameData.level;
    }

    spinAxel() {
        let rotateAnim = this.cubeStack.getComponent(Animation);
        rotateAnim.play('stackRotation');
    }

    createLevel(levelData, data) {

        let cube = levelData.cube;
        let angle = 0;
        let counter = 0;

        this.cubeStack.removeAllChildren();

        if (cube == 'SixCube') {

            let cutLen = levelData.cubelength / levelData.cut;

            for (let j = 0; j < levelData.cut; j++) {

                angle += levelData.jumpAngle * j;

                for (let index = 0; index < cutLen; index++) {

                    ++counter;

                    angle += levelData.spin;

                    let yPos = data.six_cube.dist * counter;
                    yPos = Number(yPos.toPrecision(3));

                    // console.log(yPos);
                    let newCube = instantiate(this.cubesPrefab[CUBE_TYPES.SIX_CUBE]);
                    newCube.setPosition(new Vec3(0, yPos, 0));
                    newCube.setRotationFromEuler(new Vec3(0, angle, 0));
                    (newCube.getComponent('BaseCube') as BaseCube).setBaseReference(this);

                    this.cubeStack.addChild(newCube);

                }

            }
        }

    }

    initEventListeners() {
        eventTarget.addEventListener(CUSTOM_EVENT.HIT_PRESS, () => {
            this.onHitPressed();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.HIT_RELEASE, () => {
            this.onHitRealeased();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.BREAK_CUBE, () => {
            this.onCubeBreak();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.LEVEL_COMP, () => {
            // TODO
        });
    }

    onLevelComplete() {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.LEVEL_COMP));
        this.game_over = true;
        this.game_started = false;
    }

    onBallCollision(event: ICollisionEvent) {
        if (event.otherCollider.node.name !== 'Platform') {

            if (this.hit_pressed) {
                let cube = event.otherCollider.node.parent.parent.getComponent('BaseCube') as BaseCube;
                cube.break();
            }
        }
    }

    onHitPressed() {
        this.hit_pressed = true;
        this.emptyTween && this.emptyTween.stop();
        this.fillTween = tween(this.filler)
            .to(2, { position: new Vec3(0, 0, 0) }, {
                onComplete: () => {
                    this.setBoostActive();
                }
            })
            .start();
    }

    onHitRealeased() {
        this.hit_pressed = false;
        if (!this.boostActive) {
            this.fillTween && this.fillTween.stop();
            this.emptyTween = tween(this.filler)
                .to(1, { position: new Vec3(0, -this.fillerDimention.height, 0) })
                .start();
        }
    }

    setBoostActive() {
        this.boostActive = true;
        this.filler.getComponent(Sprite).color = this.colorRed;
        this.emptyTween = tween(this.filler)
            .to(1, { position: new Vec3(0, -this.fillerDimention.height, 0) }, {
                onComplete: () => {

                    if (this.hit_pressed)
                        this.onHitPressed();

                    this.setBoostInActive();
                }
            })
            .start();
    }

    setBoostInActive() {
        this.boostActive = false;
        this.filler.getComponent(Sprite).color = this.colorGreen;
    }

    onCubeBreak() {

    }

    onHardCubeBreak() {

    }

    updateGameData(level, score) {
        let gameData = {
            level: level,
            score: score
        };

        this.savedConfig.level = gameData.level;
        this.savedConfig.score = gameData.score;
        this.current_level = gameData.level;

        localStorage.setItem(storageName, JSON.stringify(gameData));
    }

    update(deltaTime: number) {
    }
}