import {Component, _decorator} from "cc";
import {UIConf, uiManager} from "db://assets/Script/core/ui/UIManager";
import {oo} from "db://assets/Script/core/oo";
import {channel} from "db://assets/Script/example/GameChannel";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = _decorator;

export enum UIID {
    UILogin,
    UIRegister,
    UIHeader,
    UIHall,
    UINotice,
    UIWaiting,
    UIGame,
    UISettlement
}

export let UICF: { [key: number]: UIConf } = {
    [UIID.UILogin]: {prefab: "Prefab/Login"},
    [UIID.UIHall]: {prefab: "Prefab/Hall"},
    [UIID.UIHeader]: {prefab: "Prefab/Header"},
    [UIID.UIRegister]: {prefab: "Prefab/Register"},
}

@ccclass
export default class UIExample extends Component {

    onLoad() {
        oo.http.server = "http://127.0.0.1:8000";
        channel.gameCreate();
    }

    start() {
        uiManager.initUIConf(UICF);
        uiManager.open(UIID.UILogin);
    }

    update(dt) {
    }
}
