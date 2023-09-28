import {_decorator, Component, Node, Button, Label} from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {Cancel, CancelResp, GameStateResp, Join, Profile, Room} from "db://assets/demo1/proto/client";
import {CallbackObject} from "db://oops-framework/libs/network/NetInterface";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";
import {gamechannel} from "db://assets/demo1/gamechannel";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
import {GameState, GameSubState} from "db://assets/demo1/proto/consts";
import {ListView} from "db://assets/demo1/listview";
import {ErrorCode} from "db://assets/demo1/proto/error";

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

    profiles: Profile[] = [];
    readys: { [key: number]: number } = {};

    onAdded(args: any) {
        oops.log.logView(args, "waiting");
        this.room = args;
    }

    onLoad() {

    }

    start() {
        this.viewToWait();
        oops.message.on(GameEvent.GameWaitReadyEvent, this.onUpdatePlayerState, this);
    }

    protected onDestroy() {
        oops.message.off(GameEvent.GameWaitReadyEvent, this.onUpdatePlayerState, this);
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
        let resp: GameStateResp = args as GameStateResp;
        if (resp.state == GameState.WAITREADY) {
            this.btnReady.active = true;
            this.labCountDown.node.active = true;
            this.listView.node.active = true;
            this.labTest.node.active = false;
            let needRefreshList = false;
            switch (resp.subState) {
                case GameSubState.WAITREADY_PROFILE:
                    break;
                case GameSubState.WAITREADY_COUNTDOWN:
                    this.labCountDown.string = `倒计时：${resp.countDown}`;
                    let uid = oops.storage.getUser();
                    if (resp.countDown == 1 && !(uid in this.readys)) {
                        oops.gui.removeByNode(this.node, true);
                    }
                    break;
                case GameSubState.WAITREADY_READYLIST:
                    this.readys = resp.readys;
                    needRefreshList = true;
                    break
            }
            if(this.profiles.length <= 0) {
                let profiles: Profile[] = [];
                for (const [k, v] of Object.entries(resp.profiles)) {
                    profiles.push(v);
                }
                this.profiles = profiles.sort((a, b) => {
                    return a.teamId - b.teamId;
                })
                needRefreshList = true;
            }
            if (!needRefreshList) {
                return;
            }
            this.updateWaitView();
        } else if (resp.state == GameState.WAIT) {
            this.viewToWait();
        }
    }

    viewToWait() {
        this.btnReady.active = false;
        this.labCountDown.node.active = false;
        this.listView.node.active = false;
        this.labTest.node.active = true;
        this.readys = {};
        this.profiles = [];
        this.labInfo.string = `房间信息：名字：${this.room.name} 房间ID：${this.room.roomId}`;
        this.updateWaitView();
    }

    updateWaitView() {
        // 更新列表
        this.listView.setDelegate({
            items: () => this.profiles,
            reuse: (itemNode: Node, item: Profile) => {
                itemNode.getChildByName("labTeam").getComponent(Label).string = `队伍：${item.teamId}队`;
                itemNode.getChildByName("labName").getComponent(Label).string = `名字：${item.name}`;
                let tip = "等待玩家准备";
                if (this.readys[item.userId]) {
                    tip = "已准备";
                }
                itemNode.getChildByName("labState").getComponent(Label).string = `准备状态：${tip}`;
            }
        });
        this.listView.reload();
    }
}

