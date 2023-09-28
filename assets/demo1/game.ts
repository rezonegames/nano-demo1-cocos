import { _decorator, Component, Node, Label } from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
import {GameStateResp} from "db://assets/demo1/proto/client";
const { ccclass, property } = _decorator;

@ccclass('game')
export class game extends Component {

    @property(Label)
    labCountDown: Label = null!;

    start() {
        oops.message.on(GameEvent.GameCountDownEvent, this.onCountDown, this);
    }

    onLoad() {

    }

    protected onDestroy() {
        oops.message.off(GameEvent.GameCountDownEvent, this.onCountDown, this);
    }

    update(deltaTime: number) {
        
    }

    onCountDown(event:string, args:any) {
        let resp: GameStateResp = args as GameStateResp;
        if (resp.countDown == 0) {
            this.labCountDown.node.active = false;
        } else {
            this.labCountDown.string = `游戏马上开始了：${resp.countDown}`;
        }
    }
}

