import { _decorator, Component, Button, Label } from 'cc';
import {ListView} from "db://assets/demo1/listview";
import {oops} from "db://oops-framework/core/Oops";
import {Cancel, GameStateResp, Player, Profile} from "db://assets/demo1/proto/client";
import {CallbackObject} from "db://oops-framework/libs/network/NetInterface";
import {gamechannel} from "db://assets/demo1/gamechannel";
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

    resp: GameStateResp = null!;

    onAdded(args:any) {
        this.resp = args
    }

    start() {
        // 更新列表
        let profiles: Profile[] = [];
        for (const [k, v] of Object.entries(this.resp.profiles)) {
            profiles.push(v);
        }
        profiles = profiles.sort((a, b) => {
            return a.teamId - b.teamId;
        })
        this.listView.setDelegate({
            items: () => profiles,
            reuse: (itemNode: Node, item: Profile) => {
                itemNode.getChildByName("labTeam").getComponent(Label).string = `队伍：${item.teamId}队`;
                itemNode.getChildByName("labName").getComponent(Label).string = `名字：${item.name}`;
                let tip = "赢了";
                if (this.resp.tableInfo?.loseTeams[item.teamId]) {
                    tip = "输了！！！";
                }
                itemNode.getChildByName("labState").getComponent(Label).string = tip;
            }
        });
        this.listView.reload();
    }

    update(deltaTime: number) {
        
    }

    onBtnClose() {
        oops.log.logView("", "关闭结算界面");
        oops.gui.open(UIID.Hall, this.resp.roomList);
        oops.gui.remove(UIID.Game);
        oops.gui.removeByNode(this.node);
    }
}

