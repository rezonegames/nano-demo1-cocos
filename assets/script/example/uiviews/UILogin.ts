import {UIID} from "../UIExample";
import {_decorator, Label, Node,} from "cc";
import {AccountLoginReq, AccountLoginResp} from "db://assets/Script/example/proto/web";
import {ErrorCode} from "db://assets/Script/example/proto/error";
import {AccountType} from "db://assets/Script/example/proto/consts";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {oo} from "db://assets/Script/core/oo";
import {uiManager} from "db://assets/Script/core/ui/UIManager";
import {channel} from "db://assets/Script/example/Channel";

const {ccclass, property} = _decorator;

@ccclass
export default class UILogin extends UIView {

    @property(Label)
    private uri: Label

    @property(Node)
    private connect: Node

    private resp: AccountLoginResp

    onOpen(fromUI: number, ...args) {
        super.onOpen(fromUI, ...args);
        oo.http.server = `http://192.168.8.76:8000`;
        // oo.http.server = `http://192.168.3.23:8000`;
        // oo.http.server = `http://127.0.0.1:8000`;

        channel.gameClose();
        channel.gameCreate();
    }

    start() {
        this.clearConnect();
    }

    clearConnect() {
        this.connect.active = false;
    }

    setConnect(resp: AccountLoginResp) {
        this.resp = resp;
        let name = resp.name;
        if (resp.userId == 0) {
            name = "无账号，登录游戏后注册";
        }
        this.uri.string = name;
        this.connect.active = true
    }

    login(accountType: number, accountId: string) {
        this.clearConnect();
        let buf = AccountLoginReq.encode({partition: accountType, accountId: accountId}).finish();
        let complete = (response: any) => {
            let resp = AccountLoginResp.decode(response);
            oo.log.logNet(resp, "登录");
            if (resp.code == ErrorCode.OK) {
                this.setConnect(resp);
                // 账号基本信息保存在本地
                oo.storage.setUser(resp.userId);
                oo.storage.set("accountId", accountId);
                oo.storage.set("adder", resp.addr);
            }
        }
        oo.http.postProtoBufParam("/v1/login", buf, complete);
    }

    onGuestLogin() {
        this.login(AccountType.DEVICEID, "test1");
    }

    onWeiXinLogin() {
        this.login(AccountType.WX, "wxId");
    }

    onFacebookLogin() {
        this.login(AccountType.FB, "fbId");
    }

    onConnect() {
        // uiManager.replace(UIID.UIHall);
        channel.gameConnect(this.resp.addr);
    }
}
