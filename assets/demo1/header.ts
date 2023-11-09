import { _decorator, Component, Node, Label, Widget } from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
const { ccclass, property } = _decorator;

@ccclass('header')
export class header extends Component {

    @property(Label)
    labName: Label = null!;

    @property(Label)
    labCoin: Label = null!;

    onAdded(args:any) {

    }

    start() {
        this.labName.string = "";
        this.labCoin.string = "";
        oops.message.on(GameEvent.GameHeaderEvent, this.onUpdateHeader, this);
    }

    protected onDestroy() {
        oops.message.off(GameEvent.GameHeaderEvent, this.onUpdateHeader, this);
    }

    update(deltaTime: number) {
        
    }

    onUpdateHeader(event:string, args:any) {
        oops.log.logView("", "onUpdateHeader");
        const {name, coin} = args;
        this.labName.string = name;
        this.labCoin.string = coin.toString();
    }
}

