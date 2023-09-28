import {_decorator, Component, Label, Node} from 'cc';
import {AccountLoginReq, AccountLoginResp} from "db://assets/demo1/proto/web";
import {oops} from "db://oops-framework/core/Oops";
import {gamechannel} from "db://assets/demo1/gamechannel";
import {AccountType} from "db://assets/demo1/proto/consts";
import {ErrorCode} from "db://assets/demo1/proto/error";

const {ccclass, property} = _decorator;

@ccclass('login')
export class login extends Component {

    @property(Label)
    private labAddr: Label = null!;

    @property(Node)
    private connect: Node = null!;

    private resp: AccountLoginResp = null!;

    start() {
        this.clearConnect();
    }

    clearConnect() {
        this.connect.active = false;
    }

    setConnect(resp: AccountLoginResp) {
        // oops.gui.toast(resp.addr);
        this.resp = resp;
        let name = resp.name;
        if (resp.userId == 0) {
            name = "无账号，登录游戏后注册";
        }
        this.labAddr.string = name;
        this.connect.active = true
    }

    login(accountType:number, accountId: string) {
        this.clearConnect();
        let param = AccountLoginReq.encode({partition: accountType, accountId: accountId}).finish();
        var complete = (response: any) => {
            // console.log(response);
            let resp = AccountLoginResp.decode(new Uint8Array(response));
            oops.log.logNet(resp, "login");
            if (resp.code == ErrorCode.None) {
                this.setConnect(resp);
                oops.storage.setUser(resp.userId);
                oops.storage.set("accountId", accountId);
                oops.storage.set("addr", resp.addr);
            }
        }
        var error = (response: any) => {
            oops.log.logNet(response, "login.error");
        }
        // 241802429
        oops.http.postPB("/v1/login", param, complete, error);
    }

    // onBtnLogin 第三方登录
    onBtnLogin() {
        this.login(AccountType.DEVICEID, "test1");
    }

    // onBtnLogin 第三方登录
    onBtnLoginWeiXin() {
        this.login(AccountType.WX, "wxId");
    }

    // onBtnLogin 第三方登录
    onBtnLoginFacebook() {
        this.login(AccountType.FB, "fbId");
    }

    // onBtnConnect 连接
    onBtnConnect() {
        oops.log.logNet(this.resp.addr,"点击");
        gamechannel.gameConnect(this.resp.addr);
    }
}

