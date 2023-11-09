import {_decorator, Component, Label, Node} from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {gamechannel} from "db://assets/demo1/gamechannel";
import {CallbackObject} from "db://oops-framework/libs/network/NetInterface";
import {GameStateResp, Join, Room} from "db://assets/demo1/proto/client";
import {ListView} from "db://assets/demo1/listview";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
import {ErrorCode} from "db://assets/demo1/proto/error";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";

const {ccclass, property} = _decorator;

@ccclass('hall')
export class hall extends Component {
    @property(ListView)
    private listView: ListView = null!;

    roomList: Room[] = [];

    onLoad() {

    }

    protected onDestroy() {
        oops.message.off(GameEvent.HallUpdateRoomListEvent, this.onHallUpdateRoomListEvent, this);
    }

    onAdded(args: any) {
        this.roomList = args;
    }

    start() {
        this.onHallUpdateRoomListEvent("open", this.roomList);
        oops.message.on(GameEvent.HallUpdateRoomListEvent, this.onHallUpdateRoomListEvent, this);
    }

    onHallUpdateRoomListEvent(event: string, args: any) {
        this.roomList = args;
        oops.log.logView(this.roomList, "更新大厅房间列表");
        this.listView.setDelegate({
            items: () => this.roomList,
            reuse: (itemNode: Node, item: Room) => {
                itemNode.getChildByName("labName").getComponent(Label).string = `房间：${item.name}`;
                itemNode.getChildByName("btnQuickStart").on("click", () => {
                    //
                    // r.quickstart
                    let buf = Join.encode({roomId: item.roomId}).finish()
                    let rspObject: CallbackObject = {
                        target: this,
                        callback: (cmd: number, data: any) => {
                            let resp = GameStateResp.decode(new Uint8Array(data))
                            oops.log.logNet(resp, "快速开始，loading排队");
                            if (resp.code == ErrorCode.None) {
                                oops.gui.open(UIID.Waiting, item);
                            }
                        }
                    }
                    gamechannel.gameReqest("r.join", buf, rspObject);
                })
            }
        });
        this.listView.reload();
    }
}

