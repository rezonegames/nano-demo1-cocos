import {WebSock} from "db://oops-framework/libs/network/WebSock";
import {oops} from "db://oops-framework/core/Oops";
import {Logger} from "db://oops-framework/core/common/log/Logger";
import {Message} from "db://assets/demo1/nano/message";
import {
    CallbackObject,
    INetworkTips,
    IProtocolHelper,
    NetCallFunc,
    NetData
} from "db://oops-framework/libs/network/NetInterface";
import {NetNode} from "db://oops-framework/libs/network/NetNode";
import {tips} from "db://assets/script/game/common/prompt/TipsManager";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
import Protocol from "db://assets/demo1/nano/protocol";
import {IPackage, Package} from "db://assets/demo1/nano/package";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";
import {GameStateResp, LoginToGame, LoginToGameResp} from "db://assets/demo1/proto/client";
import {GameState, GameSubState} from "db://assets/demo1/proto/consts";
import {ErrorCode} from "db://assets/demo1/proto/error";
import {UICallbacks} from "db://oops-framework/core/gui/layer/Defines";

enum NetChannelType {
    /** 游戏服务器 */
    Game = 0,
}

class NetGameTips implements INetworkTips {
    /** 连接提示 */
    connectTips(isShow: boolean): void {
        if (isShow) {
            Logger.logNet("游戏服务器正在连接");
            oops.gui.open(UIID.Netinstable);
        } else {
            Logger.logNet("游戏服务器连接成功");
            oops.gui.remove(UIID.Netinstable);
        }
    }

    /** 重连接提示 */
    reconnectTips(isShow: boolean): void {
    }

    /** 请求提示 */
    requestTips(isShow: boolean): void {
        if (isShow) {

        } else {

        }
    }

    /** 响应错误码提示 */
    responseErrorCode(code: number): void {
        console.log("游戏服务器错误码", code);

        if (code < 0) {
            tips.alert("netcode_" + code, () => {
                // SDKPlatform.restartGame(;)
            });
        } else {
            tips.alert("netcode_" + code);
        }
    }
}

const route2cmd = (route: string): number => {
    let v: any = {
        "onState": 100,
        "onCountDown": 101,
        "onStateUpdate": 102,
        "onTeamLose": 103,
    }
    return v[route];
};


/** 游戏服务器心跳协议 */
class GameProtocol implements IProtocolHelper {
    getHeadlen(): number {
        return 0;
    }

    getHearbeat(): NetData {
        var buf = Package.encode(Package.TYPE_HEARTBEAT, null);
        return buf;
    }

    getPackageLen(msg: any): number {
        return msg.toString().length;
    }

    checkPackage(msg: any): boolean {
        return true;
    }

    getPackageId(msg: any): number {
        if (msg.id == 0) {
            return route2cmd(msg.route);
        }
        return msg.id;
    }
}

class NetNodeGame extends NetNode {
    private isCompress: boolean = false;
    private lastMsgId: number = 10000;
    private dict: any = {};
    private isReconnecting: boolean = false;

    constructor() {
        super();
        // 连接之后，需要发handshake
        this._connectedCallback = () => {
            let msg = {
                'sys': {
                    type: 'js-websocket',
                    version: '0.0.1',
                    rsa: {}
                },
                'user': {}
            }
            var buf = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(msg)));
            this.send(buf, true);
            oops.log.logNet(msg, "handshake");
        }
        this._reconnetTimeOut = 8000;

        // 连接关闭回调
        this._disconnectCallback = (): boolean => {
            if (this.isAutoReconnect()) {
                this.isReconnecting = true;
                return true;
            }
            return false;
        }
        this._heartTime = 1000;
    }

    onHandAck() {
        this.onChecked();
        oops.log.logNet(this.isReconnecting, "handshake结束");
        // 第一次连接
        let uid = oops.storage.getUser();
        oops.log.logView(uid, "账号");
        if (uid == 0) {
            oops.gui.remove(UIID.Login);
            oops.gui.open(UIID.Register);
        } else {
            let buf = LoginToGame.encode({userId: uid}).finish();
            let rspObject: CallbackObject = {
                target: null,
                callback: (cmd: number, data: any) => {
                    let resp = LoginToGameResp.decode(new Uint8Array(data.body));
                    oops.log.logNet(resp, "登录游戏账号");
                    if (resp.code == ErrorCode.None) {
                        // 重连，不去切换ui
                        if (this.isReconnecting) {
                            this.isReconnecting = false;
                        }
                        if(resp.tableId != "") {
                            oops.gui.open(UIID.Game);
                            return
                        }
                        if (resp.roomId != "") {
                            oops.gui.open(UIID.Waiting);
                            return;
                        }
                        oops.gui.remove(UIID.Login);
                        oops.gui.open(UIID.Hall, resp.roomList);
                        oops.message.dispatchEvent(GameEvent.GameHeaderEvent, {name:resp.player?.name, coin: resp.player?.coin});
                    } else {
                        oops.log.logNet("登录失败");
                    }
                }
            }
            this.request1("g.login", buf, rspObject);
        }
    }

    encode(reqId: number, route: string, data: any): Uint8Array {
        var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;
        var compressRoute = 0;
        if (this.dict && this.dict[route]) {
            route = this.dict[route];
            compressRoute = 1;
        }
        return Message.encode(reqId, type, compressRoute, route, data);
    }

    private processPacket(p: IPackage) {
        switch (p.type) {
            case Package.TYPE_HANDSHAKE:
                var buf = Package.encode(Package.TYPE_HANDSHAKE_ACK, null);
                this.send(buf, true);
                setTimeout(() => {
                    this.onHandAck();
                }, 1000);
                break;
            case Package.TYPE_DATA:
                let msg = Message.decode(p.body);
                // oops.log.logNet(msg, "TYPE_DATA");
                super.onMessage(msg);
                break;
            case Package.TYPE_HEARTBEAT:
                let msg1 = Message.decode(p.body);
                // oops.log.logNet("", "心跳");
                super.onMessage(msg1);
                break;
        }
    }

    protected onMessage(data: any) {
        let rs = Package.decode(data);
        for (var i = 0; i < rs.length; i++) {
            this.processPacket(rs[i])
        }
    }

    public request1(route: string, buf: NetData, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false) {
        let msgId = this.lastMsgId++;
        let pbuf = Package.encode(Package.TYPE_DATA, this.encode(msgId, route, buf));
        this.request(pbuf, msgId, rspObject, showTips, force);
    }
}

export class NetChannelManager {
    public game!: NetNodeGame;

    public gameReqest(route: string, buf: NetData, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false) {
        this.game.request1(route, buf, rspObject, showTips, force);
    }

    private gameAddNotify(route: string, callback: NetCallFunc, target?: any) {
        let cmd = route2cmd(route);
        this.game.setResponeHandler(cmd, callback, target);
    }

    // 创建游戏服务器
    public gameCreate() {
        this.game = new NetNodeGame();
        // 游戏网络事件逻辑统一在 NetGameTips 里写
        this.game.init(new WebSock(), new GameProtocol(), new NetGameTips());
        oops.tcp.setNetNode(this.game, NetChannelType.Game);

        // 通知
        // 切换界面
        this.gameAddNotify("onState", (cmd, data: any) => {
            let resp = GameStateResp.decode(new Uint8Array(data.body));
            oops.log.logNet(resp, "onState");
            switch (resp.state) {
                case GameState.IDLE:
                    oops.gui.remove(UIID.Waiting);
                    break;
                case GameState.WAIT:
                case GameState.WAITREADY:
                    oops.message.dispatchEvent(GameEvent.GameWaitReadyEvent, resp);
                    break;
                case GameState.COUNTDOWN:
                    if(resp.subState == GameSubState.COUNTDOWN_BEGIN) {
                        oops.log.logView("", "打开游戏界面");
                        oops.gui.remove(UIID.Waiting);
                        oops.gui.remove(UIID.Hall);
                        oops.gui.open(UIID.Game);
                    }
                    oops.message.dispatchEvent(GameEvent.GameCountDownEvent, resp);
                    break
                case GameState.GAMING:
                    break;
                case GameState.SETTLEMENT:
                    if(resp.subState == GameSubState.SETTLEMENT_BEGIN){
                        oops.gui.open(UIID.Settlement, resp);
                    }
                    break;
            }
        }, this);
    }

    // 连接游戏服务器
    public gameConnect(url: string) {
        oops.tcp.connect({
            url: `ws://${url}/nano`,
            autoReconnect: -1        // 手动重连接
        }, NetChannelType.Game);
    }

    /** 断开游戏服务器 */
    public gameClose() {
        oops.tcp.close(undefined, undefined, NetChannelType.Game);
    }
}

export var gamechannel = new NetChannelManager();