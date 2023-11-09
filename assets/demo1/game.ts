import { _decorator, Component, Node, Label } from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
import {GameStateResp, TableInfo} from "db://assets/demo1/proto/client";
import {TableState} from "db://assets/demo1/proto/consts";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";
const { ccclass, property } = _decorator;

@ccclass('game')
export class game extends Component {

    @property(Label)
    labCountDown: Label

    //
    // 玩家列表
    tableInfo: TableInfo


    onAdded(args: any) {

    }

    start() {
        oops.message.on(GameEvent.TableEvent, this.onTableInfo, this);
    }

    onLoad() {

    }

    protected onDestroy() {
        oops.message.off(GameEvent.TableEvent, this.onTableInfo, this);
    }

    update(deltaTime: number) {
        
    }

    onTableInfo(event:string, args:any) {
        let gameState = args as GameStateResp;
        this.tableInfo = gameState.tableInfo;

        switch (this.tableInfo.tableState) {
            case TableState.COUNTDOWN:
                if (this.tableInfo.countDown == 0) {
                    this.labCountDown.node.active = false;
                } else {
                    this.labCountDown.string = `游戏马上开始了：${this.tableInfo.countDown}`;
                }
                break;

            case TableState.SETTLEMENT:
                oops.gui.open(UIID.Settlement, gameState);
                break;

        }


    }
}

