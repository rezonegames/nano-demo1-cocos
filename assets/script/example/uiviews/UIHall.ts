import { UIID } from "../UIExample";
import { Sprite, _decorator } from "cc";
import { SpriteFrame } from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {Room} from "db://assets/Script/example/proto/client";

const {ccclass, property} = _decorator;

@ccclass
export default class UIHall extends UIView {

    public onOpen(fromUI: number, ...args : any): void {
        let roomList = args as Room[];
    }

}
