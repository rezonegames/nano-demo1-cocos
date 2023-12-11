import {UIID} from "../UIExample";
import {Sprite, _decorator, Label} from "cc";
import {SpriteFrame} from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {EventMgr} from "db://assets/Script/core/common/EventManager";
import {Profile} from "db://assets/Script/example/proto/client";
import {ItemType} from "db://assets/Script/example/proto/consts";

const {ccclass, property} = _decorator;

@ccclass
export default class UIHeader extends UIView {

    @property(Label)
    myName: Label

    @property(Label)
    myCoin: Label

    onOpen(fromUI: number, ...args) {
        super.onOpen(fromUI, ...args);
        this.myName.string = "";
        this.myCoin.string = "";

        EventMgr.addEventListener("onUserInfo", this.onUserInfo, this);
    }

    onDestroy() {
        super.onDestroy();
        EventMgr.removeEventListener("onUserInfo", this.onUserInfo, this);
    }

    onUserInfo(event: string, args: any) {
        let profile = args as Profile;
        this.myName.string = `ID：${profile.userId} 名字：${args.name}`;

        // 道具
        let my = "";
        profile.itemList?.forEach((item)=>{
            switch (item.key) {
                case ItemType.COIN:
                    my += `金币：${item.val} `;
                    break;
                default:
                    break;
            }
        })
        this.myCoin.string = my;
    }
}
