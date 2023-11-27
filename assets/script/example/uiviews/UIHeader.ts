import {UIID} from "../UIExample";
import {Sprite, _decorator, Label} from "cc";
import {SpriteFrame} from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {EventMgr} from "db://assets/Script/core/common/EventManager";

const {ccclass, property} = _decorator;

@ccclass
export default class UIHeader extends UIView {

    @property(Label)
    myName: Label

    @property(Label)
    myCoin: Label

    onOpen(fromUI: number, ...args) {
        super.onOpen(fromUI, ...args);
        EventMgr.addEventListener("onUserInfo", this.onUserInfo, this);
    }

    onDestroy() {
        super.onDestroy();
        EventMgr.removeEventListener("onUserInfo", this.onUserInfo, this);
    }

    onUserInfo(event: string, args: any) {
        this.myName.string = `名字：${args.name}`;
        this.myCoin.string = `金币：${args.coin}`;
    }
}
