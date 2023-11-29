import {_decorator, instantiate, Label, Node, Prefab, Button} from "cc";
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
        tetris.onAdded({uid: player.profile?.userId, draw0: true, teamId: player.teamId});
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

    // 发送状态数据
    serialize(action: ActionType, valList: number[], to: number = 0, from: number = 0) {
        let buf = UpdateFrame.encode({action: {key: action, valList, from, to}}).finish();
        channel.gameNotify("r.update", buf);
    }

    // 解析状态数据
    unserialize(tetris: Tetris, msg: OnFrame_Player) {

        const addCombo = function (action: Action) {

        }

        let actionList = msg.actionList;
        let uid = msg.userId;
        actionList.forEach((action: Action) => {
            let valList = action.valList;
            switch (action.key) {
                case ActionType.MOVE:
                    tetris.player.move(valList[0]);
                    break;
                case ActionType.DROP:
                    for (let i = 0; i < valList[0]; i++) {
                        tetris.player.drop();
                    }
                    break;
                case ActionType.QUICK_DROP:
                    tetris.player.dropDown();
                    break;
                case ActionType.ROTATE:
                    tetris.player.rotate(valList[0]);
                    break;
                case ActionType.COMBO:
                    this.addCombo(tetris, action.valList);
                    break;

                case ActionType.COMBO_3:
                case ActionType.COMBO_4:
                    for (let i = 0; i < action.valList.length; i += 2) {
                        this.addCombo(tetris, action.valList.slice(i, i + 2));
                    }
                    break;
                default:
                    break
            }
        });
    }

    public addCombo(tetris: Tetris, valList: number[]) {
        let row: Array<number> = []
        for (let i = 0; i < 12; i++) {
            let v = valList.indexOf(i) !== -1 ? 0 : 3;
            row.push(v);
        }
        for (const [_, t] of Object.entries(this.tetrisManager)) {
            if (t.player.teamId !== tetris.player.teamId) {
                t.arena.push(row);
            }
        }
    }

    public onFrame(event: string, args: any) {
        let frame = args as OnFrame;
        oo.log.logView(frame, "onFrame");
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

    update(deltaTime: number) {
        //
    }

    onLeft() {
        this.serialize(ActionType.MOVE, [-1])
    }

    onRight() {
        this.serialize(ActionType.MOVE, [1])
    }

    onUp() {
        let val = 1;
        if (this.my.player.disturbBuff) {
            val = oo.random.getRandomInt(0, 1) == 0 ? 1 : -1;
        }
        this.serialize(ActionType.ROTATE, [val])
    }

    onDrop() {
        this.serialize(ActionType.DROP, [1])
    }

    onQuick() {
        this.serialize(ActionType.QUICK_DROP, [0])
    }
}
