import { _decorator, Component, Node, PhysicsSystem, JsonAsset, Prefab, instantiate, Vec2, Vec3, Animation, Sprite, UITransform, tween, macro } from 'cc';
import { BaseCube } from './cubeTypes/BaseCube';
const { ccclass, property } = _decorator;

export const storageName = 'rajgamesdata';
export const eventTarget = new EventTarget();

const cubeBreakMultiplier = 20;

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

    savedConfig: {
        level: number,
        score: number
    }

    spinDir = {
        right: false,
        left: false
    }

    max_level = 0;
    current_level = 0;
    hit_pressed = false;

    meter_progress = 100;
    boost_progress = 0;


    start() {

        PhysicsSystem.instance.enable = true;
        this.initConfigData();

        let data = this.gameConfig.json;
        this.max_level = data['levels'].length;


        let lData = data['levels'][this.savedConfig.level];
        this.createLevel(lData, data);

        this.initEventListeners();
        this.spinAxel();

        this.filler.position.set(0, 0, 0);

        /* 
        tween(this.filler)
            .repeatForever(tween()
                .to(2, { position: new Vec3(0, 0, 0) })
                .call(() => {
                    this.filler.position.set(0, -451, 0);
                }))
            .start(); */

        this.startTimer();
    }

    startTimer() {
        this.schedule(() => {

            this.updateMeterValue();
            this.updateBootValue();

        }, 0.1, macro.REPEAT_FOREVER, 0);
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
    }

    onLevelComplete() {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.LEVEL_COMP));
    }

    onHitPressed() {
        this.hit_pressed = true;
        console.log('hit-pressed');
    }

    onHitRealeased() {
        this.hit_pressed = false;
        console.log('hit-release');
    }

    onCubeBreak() {

        this.meter_progress += cubeBreakMultiplier;
        if (this.meter_progress > 100) {
            this.meter_progress = 100;
        }

        let fillerDimention = this.filler.getComponent(UITransform);
        let yPos = fillerDimention.height * (this.meter_progress / 100);


        tween(this.filler)
            .to(0.1, { position: new Vec3(0, -(fillerDimention.height - yPos), 0) })
            .start();

    }

    onHardCubeBreak() {

    }

    updateBootValue() {

        this.boost_progress -= 1;
        if (this.boost_progress < 0)
            this.boost_progress = 0;

    }

    updateMeterValue() {

        this.meter_progress -= 1;
        if (this.meter_progress < 0)
            this.meter_progress = 100;


        let fillerDimention = this.filler.getComponent(UITransform);
        let yPos = fillerDimention.height * (this.meter_progress / 100);
        this.filler.position.set(0, -(fillerDimention.height - yPos), 0);

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

