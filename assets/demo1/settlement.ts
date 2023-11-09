import { _decorator, Component, Button, Label, Node } from 'cc';
import {ListView} from "db://assets/demo1/listview";
import {oops} from "db://oops-framework/core/Oops";
import {GameStateResp, Player, Profile, Room, TableInfo, TableInfo_Player} from "db://assets/demo1/proto/client";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";
const { ccclass, property } = _decorator;

@ccclass('settlement')
export class settlement extends Component {

    @property(Label)
    labInfo: Label = null!;

    @property(Button)
    btnClose: Button = null!;

    @property(ListView)
    listView: ListView = null!;

    tableInfo: TableInfo;
    roomList: Room[];

    onAdded(args:any) {
        let gameState = args as GameStateResp;
        this.roomList = gameState.roomList;
        this.tableInfo = gameState.tableInfo;
    }

    start() {
        // 更新列表
        let players: TableInfo_Player[] = [];
        for (const [k, v] of Object.entries(this.tableInfo.players)) {
            players.push(v);
        }
        players = players.sort((a, b) => {
            return a.teamId - b.teamId;
        })
        this.listView.setDelegate({
            items: () => players,
            reuse: (itemNode: Node, item: TableInfo_Player) => {
                let p = item.profile;
                itemNode.getChildByName("labTeam").getComponent(Label).string = `队伍：${item.teamId}队`;
                itemNode.getChildByName("labName").getComponent(Label).string = `名字：${p.name}`;
                let tip = "赢了";
                if (this.tableInfo?.loseTeams[item.teamId]) {
                    tip = "输了！！！";
                }
                itemNode.getChildByName("labState").getComponent(Label).string = tip;
            }
        });
        this.listView.reload();
        this.labInfo.string = `结算-房间信息：名字：1v1 房间ID：1`
    }

    update(deltaTime: number) {
        
    }

    onBtnClose() {
        oops.log.logView("", "关闭结算界面");
        oops.gui.open(UIID.Hall, this.roomList);
        oops.gui.remove(UIID.Game);
        oops.gui.removeByNode(this.node, true);
    }
}

