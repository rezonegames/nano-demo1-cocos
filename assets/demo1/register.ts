import {_decorator, Component, EditBox, Label} from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {LoginToGameResp, RegisterGameReq} from "db://assets/demo1/proto/client";
import {gamechannel} from "db://assets/demo1/gamechannel";
import {CallbackObject} from "db://oops-framework/libs/network/NetInterface";
import {ErrorCode} from "db://assets/demo1/proto/error";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";

const {ccclass, property} = _decorator;

@ccclass('register')
export class register extends Component {

    @property(Label)
    private labAccountId: Label = null!;

    @property(EditBox)
    private edName: EditBox = null!;

    start() {
        this.labAccountId.string = oops.storage.get("accountId");
    }

    update(deltaTime: number) {

    }

    onBtnRegister() {
        let buf = RegisterGameReq.encode({name: this.edName.string, accountId: this.labAccountId.string}).finish();
        let rspObject: CallbackObject = {
            target: null,
            callback: (cmd: number, data: any) => {
                let resp = LoginToGameResp.decode(new Uint8Array(data.body));
                oops.log.logNet(resp, "注册游戏账号");
                if (resp.code == ErrorCode.None) {
                    oops.gui.removeByNode(this.node);
                    oops.gui.open(UIID.Hall, resp.roomList);
                    oops.message.dispatchEvent(GameEvent.GameHeaderEvent, {name:resp.player?.name, coin: resp.player?.coin});
                }
            }
        }
        gamechannel.gameReqest("g.register", buf, rspObject);
    }
}

