import { _decorator, Component, Node, PhysicsSystem, JsonAsset, Prefab, instantiate, Vec2, Vec3, Animation, Sprite, UITransform, tween, macro, ICollisionEvent, Tween, Color, game, profiler, director, easing } from 'cc';
import { Ball } from './Ball';
import { GameCamera } from './Camera';
import { BaseCube } from './cubeTypes/BaseCube';
const { ccclass, property } = _decorator;

export const storageName = 'rajgamesdata';
export const eventTarget = new EventTarget();

export const enum CUSTOM_EVENT {
    HIT_PRESS = 'onhitpress',
    HIT_RELEASE = 'onhitrelease',
    GAME_PAUSED = 'gamePaused',
    GAME_RESUME = 'gameResume',
    BREAK_CUBE = 'breakcube',
    LEVEL_COMP = 'levelcomplete',
    SET_LEVEL = 'setlevel',
    PLAY_GAME = 'PLAY_GAME',
    QUIT_GAME = 'QUIT_GAME',
    BALL_COLLIDE = 'BALL_COLLIDE',
    HARD_CUBE = 'HARD_CUBE',
    PLAYER_DEAD = 'PLAYER_DEAD',
    NEW_GAME = 'NEW_GAME'
}

export const enum CUBE_TYPES {
    SIX_CUBE,
    FLOWER,
    SPIKE,
    SQUARE,
    CIRCLE
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
    levelOver = false;
    game_over = true;

    level_data = null;

    fillTween: Tween<Node>;
    emptyTween: Tween<Node>;

    colorRed: Color;
    colorGreen: Color;

    boostActive = false;
    ballLastPosition = 0;

    cubeHeight = 0.7;
    cubeDist = 0.4;

    onLoad() {

        game.frameRate = 60;
        profiler.hideStats();

        (this.ball.getComponent('Ball') as Ball).mainScene = this;

        let camera = this.camera.getComponent('GameCamera') as GameCamera;
        camera.gameOver = false;

        this.fillerDimention = this.filler.getComponent(UITransform);
        this.colorRed = new Color().fromHEX('#ff0000');
        this.colorGreen = new Color().fromHEX('#00ff00');
    }

    resetComponents() {

        this.levelOver = false;
        this.cubeStack.removeAllChildren();

        this.filler.getComponent(Sprite).color = this.colorGreen;
        this.filler.setPosition(new Vec3(0, -this.fillerDimention.height, 0));
    }

    start() {
        this.resetComponents();

        PhysicsSystem.instance.enable = true;
        this.initConfigData();

        this.createLevel();

        this.initEventListeners();
        this.spinAxel();

        let bPos = this.cubeStack.children.length * this.cubeDist + 5;
        this.ballLastPosition = bPos;
        this.ball.setPosition(new Vec3(this.ball.position.x, bPos, this.ball.position.z));

        (this.ball.getComponent('Ball') as Ball).initBall();

        let camera = this.camera.getComponent('GameCamera') as GameCamera;
        camera.initCamera();
    }

    onQuitGame() {
        director.end();
    }

    startGame() {
        this.game_over = false;
        this.game_started = true;
    }

    startNewGame() {

        this.resetComponents();
        this.createLevel();
        this.spinAxel();

        this.resetBallAndCamera(() => {

            (this.ball.getComponent('Ball') as Ball).initBall();

            let camera = this.camera.getComponent('GameCamera') as GameCamera;
            camera.initCamera();
            camera.gameOver = false;

            eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.NEW_GAME));

            this.game_over = false;
            this.game_started = true;

        });
    }

    pauseGame(isPaused: boolean) {
        this.game_started = !isPaused;
        this.onHitRealeased();
    }

    initConfigData() {

        this.savedConfig = {
            level: 0,
            score: 0
        };

        let gameData = JSON.parse(localStorage.getItem(storageName));
        // gameData = null;
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
        rotateAnim.stop();
        rotateAnim.play('stackRotation');
    }

    stopSpinAxel() {
        let rotateAnim = this.cubeStack.getComponent(Animation);
        rotateAnim.stop();
    }

    createLevel() {

        let data: any = this.gameConfig.json;
        this.cubeDist = data.six_cube.dist;

        this.max_level = data['levels'].length;

        let lData = data['levels'][this.savedConfig.level];
        this.level_data = lData;

        let cubeStr = this.level_data.cube;
        let angle = 0;
        let counter = 0;

        this.cubeStack.removeAllChildren();

        let cutLen = this.level_data.cubelength / this.level_data.cut;

        for (let j = 0; j < this.level_data.cut; j++) {

            angle += this.level_data.jumpAngle * j;

            for (let index = 0; index < cutLen; index++) {

                ++counter;

                angle += this.level_data.spin;

                let yPos = this.cubeDist * counter;
                yPos = Number(yPos.toPrecision(3));

                let newCube = instantiate(this.cubesPrefab[this.getCubeEnum(cubeStr)]);
                newCube.setPosition(new Vec3(0, yPos, 0));
                newCube.setRotationFromEuler(new Vec3(0, angle, 0));
                (newCube.getComponent('BaseCube') as BaseCube).setBaseReference(this);

                this.cubeStack.addChild(newCube);

            }
        }

    }

    getCubeEnum(cube: string) {
        switch (cube) {
            case 'SixCube':
                return CUBE_TYPES.SIX_CUBE;
            case 'FlowerCube':
                return CUBE_TYPES.FLOWER;
            case 'SpikeCube':
                return CUBE_TYPES.SPIKE;
            case 'SquareCube':
                return CUBE_TYPES.SQUARE;
            case 'CircleCube':
                return CUBE_TYPES.CIRCLE;
            default:
                console.log('Invalid cube type in JSON');
                break;
        }
    }

    initEventListeners() {
        eventTarget.addEventListener(CUSTOM_EVENT.PLAY_GAME, () => {
            this.startGame();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.QUIT_GAME, () => {
            this.onQuitGame();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.HIT_PRESS, () => {
            this.onHitPressed();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.GAME_PAUSED, () => {
            this.pauseGame(true);
        });
        eventTarget.addEventListener(CUSTOM_EVENT.GAME_RESUME, () => {
            this.pauseGame(false);
        });
        eventTarget.addEventListener(CUSTOM_EVENT.HIT_RELEASE, () => {
            this.onHitRealeased();
        });
        eventTarget.addEventListener(CUSTOM_EVENT.LEVEL_COMP, () => {
            if (this.max_level >= this.current_level) {
                ++this.current_level;
                this.updateGameData();
                this.scheduleOnce(this.startNewGame, 2);
            }
        });
    }

    onLevelComplete() {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.LEVEL_COMP));
        this.levelOver = true;
        this.onHitRealeased();
    }

    onBallCollision(event: ICollisionEvent) {

        if (!this.game_over) {

            if (event.otherCollider.node.name !== 'Platform') {

                if (event.otherCollider.node.name == 'polySurface1') {
                    this.onHardCubeBreak(event);
                } else {
                    this.onCubeBreak(event);
                }
            } else {
                if (!this.levelOver)
                    this.onLevelComplete();
            }
        }

    }

    onHitPressed() {
        if (!this.levelOver && !this.game_over) {

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

    onCubeBreak(event: ICollisionEvent) {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.BALL_COLLIDE));

        if (this.hit_pressed) {
            let cube = event.otherCollider.node.parent.parent.getComponent('BaseCube') as BaseCube;
            cube.break();
        }
    }

    onHardCubeBreak(event: ICollisionEvent) {
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.BALL_COLLIDE));

        if (this.hit_pressed) {

            if (this.boostActive) {
                eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.HARD_CUBE));

                let cube = event.otherCollider.node.parent.parent.getComponent('BaseCube') as BaseCube;
                cube.break();
            } else {
                this.onGameOver();
            }
        }
    }

    onGameOver() {
        this.game_over = true;
        this.onHitRealeased();
        eventTarget.dispatchEvent(new Event(CUSTOM_EVENT.PLAYER_DEAD));
        this.scheduleOnce(this.startNewGame, 2);
    }

    resetBallAndCamera(callback: Function) {

        let camera = this.camera.getComponent('GameCamera') as GameCamera;
        camera.gameOver = true;

        let bPos = this.cubeStack.children.length * this.cubeDist + 5;
        this.ball.setPosition(new Vec3(this.ball.position.x, bPos, this.ball.position.z));

        this.scheduleOnce(callback, 1);

        // tween(this.ball)
        //     .to(2, { position: new Vec3(this.ball.position.x, bPos, this.ball.position.z) }, {
        //         onComplete: () => {
        //             callback();
        //         }
        //     })
        //     .start();
    }

    updateGameData() {

        let data = JSON.parse(localStorage.getItem(storageName));

        let gameData = {
            level: this.current_level,
            score: data.score
        };

        this.savedConfig.level = gameData.level;
        this.savedConfig.score = gameData.score;

        localStorage.setItem(storageName, JSON.stringify(gameData));
    }
}