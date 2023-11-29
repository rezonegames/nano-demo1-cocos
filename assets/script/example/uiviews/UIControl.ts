import {_decorator, Button, instantiate, Label, Node, Prefab} from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {
    Action,
    LoadRes,
    OnFrame,
    OnFrame_Player,
    Room,
    TableInfo,
    TableInfo_Player,
    UpdateFrame
} from "db://assets/Script/example/proto/client";
import {oo} from "db://assets/Script/core/oo";
import {Tetris} from "db://assets/Script/example/Tetris";
import {ActionType} from "db://assets/Script/example/proto/consts";
import {EventMgr} from "db://assets/Script/core/common/EventManager";
import {channel} from "db://assets/Script/example/Channel";

const {ccclass, property} = _decorator;

@ccclass
export default class UIControl extends UIView {

    private my: Tetris

    @property(Label)
    private title: Label

    @property(Prefab)
    tetris: Prefab

    // tetris管理器
    tetrisManager: { [key: number]: Tetris } = {};

    onDestroy() {
        super.onDestroy();
        EventMgr.removeEventListener("onFrame", this.onFrame, this);
        oo.log.logView("UIControl.onDestroy");
    }

    @property([Button])
    buttonArray: Button[]

    public onOpen(fromUI: number, ...args) {
        super.onOpen(fromUI, ...args);
        oo.log.logView(args, "UIControl.onOpen");
        EventMgr.addEventListener("onFrame", this.onFrame, this);
        let tableInfo = args[0] as TableInfo;
        let room: Room = tableInfo.room;
        this.title.string = room.name
        oo.random.isClient = true;
        oo.random.isGlobal = true;
        oo.random.setSeed(tableInfo.randSeed);
        // 初始化
        switch (room.roomId) {
            // 1v1
            case "1":
                oo.res.load("Prefab/Game1v1", Prefab, (err: Error | null, prefab: Prefab) => {
                    if (err) {
                        oo.log.logView(err, "加载失败");
                        return;
                    }

                    let parent: Node = instantiate(prefab);
                    this.node.addChild(parent);
                    // 保存
                    for (const [uid, player] of Object.entries(tableInfo.players)) {
                        let name: string = parseInt(uid) == oo.storage.getUser() ? "my" : "enemy";
                        let t: Tetris = parent.getChildByName(name).getComponent("Tetris") as Tetris;
                        this.initTetris(player, t);
                        if (name == "my") {
                            this.my = t;
                        }
                        this.tetrisManager[uid] = t;
                    }
                    oo.log.logView("", "res.ok");
                    let buf = LoadRes.encode({current: 100}).finish();
                    channel.gameNotify("r.loadres", buf);
                });
                break
            case "2":
                break;
            default:
                break
        }


    }

    initTetris(player: TableInfo_Player, tetris: Tetris) {
        tetris.onAdded({uid: player.profile?.userId, draw0: false, teamId: player.teamId});
        // 玩家的所有事件
        ['pos', 'end', 'matrix', 'score', 'combo', 'combo_3', 'combo_4'].forEach(key => {
            let from = oo.storage.getUser() == tetris.player.uid ? 0 : tetris.player.uid;
            tetris.player.events.on(key, (val) => {
                switch (key) {
                    case "score":
                        tetris.updateScore(val);
                        break;
                    case "end":
                        this.serialize(ActionType.END, [], 0, from);
                        break;
                    case "pos":
                    case "matrix":
                        tetris.draw();
                        break;
                    case "combo":
                        if (from == 0) {
                            let valList = oo.random.getRandomByMinMaxList(0, 11, 2);
                            this.serialize(ActionType.COMBO, valList);
                        }
                        break;
                    case "combo_3":
                        if (from == 0) {
                            let valList = oo.random.getRandomByMinMaxList(0, 11, 4);
                            this.serialize(ActionType.COMBO_3, valList);
                        }
                        break;
                    case "combo_4":
                        if (from == 0) {
                            let valList = oo.random.getRandomByMinMaxList(0, 11, 6);
                            this.serialize(ActionType.COMBO_3, valList);
                        }
                        break
                    default:
                        break
                }
            })
        });

        // 所有区域的事件
        ["matrix"].forEach(key => {
            tetris.arena.events.on("matrix", (val) => {
                tetris.draw();
            })
        });
    }

    // 发送操作数据
    serialize(action: ActionType, valList: number[], to: number = 0, from: number = 0) {
        let buf = UpdateFrame.encode({action: {key: action, valList, from, to}}).finish();
        channel.gameNotify("r.update", buf);
    }

    // 解析网络过来的操作数据
    unserialize(tetris: Tetris, msg: OnFrame_Player) {
        let actionList = msg.actionList;
        let uid = msg.userId;

        actionList.forEach((action: Action) => {
            let valList = action.valList;
            let to = this.tetrisManager[action.to];
            switch (action.key) {
                case ActionType.MOVE:
                    for (let i = 0; i < valList.length; i++) {
                        tetris.player.move(valList[i]);
                    }
                    break;
                case ActionType.DROP:
                    for (let i = 0; i < valList.length; i++) {
                        tetris.player.drop();
                    }
                    break;
                case ActionType.QUICK_DROP:
                    tetris.player.dropDown();
                    break;
                case ActionType.ROTATE:
                    for (let i = 0; i < valList.length; i++) {
                        tetris.player.rotate(valList[i]);
                    }
                    break;
                // 队伍不一样，从下往上加
                case ActionType.COMBO:
                case ActionType.COMBO_3:
                case ActionType.COMBO_4:
                    for (const [_, t] of Object.entries(this.tetrisManager)) {
                        if (t.player.teamId !== tetris.player.teamId) {
                            for (let i = 0; i < valList.length; i += 2) {
                                t.arena.push(valList.slice(i, i + 2));
                            }
                        }
                    }
                    break;
                case ActionType.ITEM_ADD_ROW:
                    for (let i = 0; i < valList.length; i += 2) {
                        to.arena.push(valList.slice(i, i + 2));
                    }
                    break;
                case ActionType.ITEM_DEL_ROW:
                    for (let i = 0; i < valList[0]; i++) {
                        to.arena.unshift();
                    }
                    break;
                case ActionType.ITEM_BOOM:
                    to.arena.setMatrix(valList);
                    break;
                case ActionType.ITEM_BUFF_DISTURB:
                    to.player.addDisturbBuff(valList[0]);
                    break;
                default:
                    break
            }
        });
    }

    public onFrame(event: string, args: any) {
        let frame = args as OnFrame;
        // oo.log.logView(frame, "onFrame");
        if (frame.frameId == 0) {
            for (const [uid, t] of Object.entries(this.tetrisManager)) {
                t.player.pieceList = frame.pieceList;
                t.player.reset();
            }
        } else {
            frame.playerList.forEach((player: OnFrame_Player) => {
                let t = this.tetrisManager[player.userId];
                if (t.player) {
                    this.unserialize(t, player);
                }
            })
        }
    }

    touch(val: number, touchCounter: number, offset: number = 0): number[] {
        // 有buff，是反的
        if (this.my.player.disturbBuff) {
            val = oo.random.getRandomInt(0, 1) == 0 ? val : -val;
        }
        let valList: number[] = [];
        if (touchCounter <= 4) {
            valList.push(val);
        } else if (touchCounter > 4 && touchCounter < 8) {
            valList.push(val, val)
        } else if (touchCounter >= 8 && touchCounter < 15) {
            valList.push(val, val, val)
        } else {
            for (let i = this.my.player.pos.x - offset; i >= 0; i--) {
                valList.push(val)
            }
        }
        return valList;
    }

    onLeft(touchCounter: number, customEventData?: any) {
        this.serialize(ActionType.MOVE, this.touch(-1, touchCounter));
    }

    onRight(touchCounter: number, customEventData?: any) {
        this.serialize(ActionType.MOVE, this.touch(1, touchCounter));
    }

    onUp() {
        this.serialize(ActionType.ROTATE, this.touch(1, 1));
    }

    onDrop(touchCounter: number, customEventData?: any) {
        this.serialize(ActionType.DROP, this.touch(1, touchCounter, 1));
    }

    onQuick() {
        this.serialize(ActionType.QUICK_DROP, [0])
    }
}
