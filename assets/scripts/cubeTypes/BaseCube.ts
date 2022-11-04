import { _decorator, Component, Node, ICollisionEvent } from 'cc';
import { MainScene } from '../MainScene';
const { ccclass, property } = _decorator;

@ccclass('BaseCube')
export class BaseCube extends Component {

    _mainScene: MainScene;

    setBaseReference(main: MainScene) {
        this._mainScene = main;
    }

}

