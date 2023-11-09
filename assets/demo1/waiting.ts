import {_decorator, Component, Label, Node} from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {
    Cancel,
    CancelResp,
    GameStateResp,
    Profile,
    Room,
    TableInfo,
    TableInfo_Player
} from "db://assets/demo1/proto/client";
import {CallbackObject} from "db://oops-framework/libs/network/NetInterface";
import {gamechannel} from "db://assets/demo1/gamechannel";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
import {GameState, TableState} from "db://assets/demo1/proto/consts";
import {ListView} from "db://assets/demo1/listview";

const {ccclass, property} = _decorator;

@ccclass('waiting')
export class waiting extends Component {

    private room: Room = null!;

    @property(Label)
    labCountDown: Label = null!;

    @property(Label)
    labTest: Label = null!;

    @property(Label)
    labInfo: Label = null!;

    @property(ListView)
    listView: ListView = null!;

    @property(Node)
    btnReady: Node = null!;

    tableInfo: TableInfo

    oldReadyList: { [key: number]: number } = {};

    onAdded(args: any) {
        oops.log.logView(args, "waiting");
        this.room = args;
    }

    onLoad() {

    }

    start() {
        this.viewToWait();
        oops.message.on(GameEvent.TableEvent, this.onUpdatePlayerState, this);
    }

    protected onDestroy() {
        oops.message.off(GameEvent.TableEvent, this.onUpdatePlayerState, this);
    }

    public onBtnCancel() {
        let buf = Cancel.encode({}).finish();
        let respObject: CallbackObject = {
            target: this,
            callback: (cmd: number, data: any) => {
                this.viewToWait();
                oops.gui.removeByNode(this.node, true);
            }
        }
        gamechannel.gameReqest("r.cancel", buf, respObject);
    }

    public onBtnReady() {
        let buf = Cancel.encode({}).finish();
        let respObject: CallbackObject = {
            target: this,
            callback: (cmd: number, data: any) => {
                let resp = CancelResp.decode(new Uint8Array(data));
                oops.log.logNet(resp, "ready返回");
            }
        }
        gamechannel.gameReqest("r.ready", buf, respObject);
    }

    public onUpdatePlayerState(event: string, args: any) {
        let gameState = args as GameStateResp;

        switch (gameState.state) {
            case GameState.WAIT:
                this.viewToWait();
                break;
            case GameState.INGAME:
                this.tableInfo = gameState.tableInfo;
                switch (this.tableInfo.tableState) {
                    case TableState.WAITREADY:
                        this.btnReady.active = true;
                        this.labCountDown.node.active = true;
                        this.listView.node.active = true;
                        this.labTest.node.active = false;

                        let countDown = this.tableInfo.waiter.countDown;
                        let readys = this.tableInfo.waiter.readys;
                        let uid = oops.storage.getUser();

                        //
                        // 更新ui
                        this.labCountDown.string = `倒计时：${countDown}`;
                        if (countDown == 1 && !(uid in readys)) {
                            oops.gui.removeByNode(this.node, true);
                        }

                        //
                        // 更新list
                        if(Object.keys(readys).length !=0 && Object.keys(readys).length == Object.keys(this.oldReadyList).length) {
                            return;
                        }

                        let profiles: TableInfo_Player[] = [];
                        for(const k in this.tableInfo.players) {
                            let p = this.tableInfo.players[k];
                            profiles.push(p);
                        }
                        profiles = profiles.sort((a, b) => {
                            return a.teamId - b.teamId;
                        })
                        this.updateWaitView(profiles, readys);
                        this.oldReadyList = readys;
                        break;

                }

                break;
        }
    }

    viewToWait() {
        this.tableInfo = null;
        this.btnReady.active = false;
        this.labCountDown.node.active = false;
        this.listView.node.active = false;
        this.labTest.node.active = true;
        this.labInfo.string = `房间信息：名字：${this.room.name} 房间ID：${this.room.roomId}`;
        this.updateWaitView([], {});
    }

    updateWaitView(profiles:TableInfo_Player[], readys: { [key: number]: number }) {
        //
        // 更新列表
        this.listView.setDelegate({
            items: () => profiles,
            reuse: (itemNode: Node, item: TableInfo_Player) => {
                let p = item.profile;
                itemNode.getChildByName("labTeam").getComponent(Label).string = `队伍：${item.teamId}队`;
                itemNode.getChildByName("labName").getComponent(Label).string = `名字：${p.name}`;
                let tip = "等待玩家准备";
                if (readys[p.userId]) {
                    tip = "已准备";
                }
                itemNode.getChildByName("labState").getComponent(Label).string = `准备状态：${tip}`;
            }
        });
        this.listView.reload();
    }
}

