import {_decorator, Button, instantiate, Label, Node, Prefab, UITransform, Sprite} from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {
    Action,
    LoadRes,
    OnFrame,
    OnFrame_Player, OnFrameList,
    Room,
    TableInfo,
    TableInfo_Player,
    UpdateFrame
} from "db://assets/Script/example/proto/client";
import {oo} from "db://assets/Script/core/oo";
import {Tetris} from "db://assets/Script/example/Tetris";
import {ActionType} from "db://assets/Script/example/proto/consts";
import {channel} from "db://assets/Script/example/Channel";

const {ccclass, property} = _decorator;

@ccclass
export default class UIControl extends UIView {

    private my: Tetris

    @property(Label)
    private title: Label

    @property(Prefab)
    tetris: Prefab

    @property([Button])
    buttonArray: Button[]

    tetrisManager: { [key: number]: Tetris } = {};

    // 帧数据
    curFrame: number = 0;
    frameList: OnFrame[] = [];
    isResume: boolean = false;

    public onOpen(fromUI: number, ...args) {
        super.onOpen(fromUI, ...args);
        oo.log.logView(args, "UIControl.onOpen");
        oo.event.addEventListener("onFrame", this.onFrame, this);
        let tableInfo = args[0] as TableInfo;
        let room: Room = tableInfo.room;
        this.title.string = room.name
        oo.random.setSeed(tableInfo.randSeed);

        oo.res.load([`Prefab/${room.prefab}`, "Prefab/Tetris"], Prefab, (err: Error | null, prefabs: Prefab[]) => {
            if (err) {
                oo.log.logView(err, "加载失败");
                return;
            }

            let parent: Node = instantiate(prefabs[0]);
            this.node.addChild(parent);

            // 保存
            let [i, j] = [1, 1];
            let my = tableInfo.players[oo.storage.getUser()];
            for (const [uid, player] of Object.entries(tableInfo.players)) {
                let containerName = "";
                if(player.teamId !== my.teamId) {
                    containerName = `enemy${i}`;
                    i++;
                } else {
                    if (parseInt(uid) == player.profile.userId) {
                        containerName = "my";
                    } else {
                        containerName = `mate${j}`;
                        j++;
                    }
                }
                let container: Node = parent.getChildByName(containerName);
                let tNode: Node = instantiate(prefabs[1]);
                let t: Tetris = tNode.getComponent("Tetris") as Tetris;
                this.initTetris(player, t);
                if (containerName == "my") {
                    this.my = t;
                } else {
                    let s = container.getComponent(UITransform).width*1.0/500;
                    tNode.setScale(s, s);
                }
                container.getComponent(Sprite).spriteFrame = null;
                oo.log.logView(containerName, "containerName");

                container.addChild(tNode);
                this.tetrisManager[uid] = t;
            }
            this.resProgress();

        });


    }

    resProgress() {
        oo.log.logView("", "res.ok");
        let buf = LoadRes.encode({current: 100}).finish();
        channel.gameNotify("r.loadres", buf);
    }

    onDestroy() {
        super.onDestroy();
        oo.event.removeEventListener("onFrame", this.onFrame, this);
        oo.log.logView("UIControl.onDestroy");
    }

    initTetris(player: TableInfo_Player, tetris: Tetris) {
        tetris.onAdded({uid: player.profile?.userId, draw0: player.profile?.userId === oo.storage.getUser(), teamId: player.teamId});
        // 玩家的所有事件
        ['nextPiece', 'pos', 'end', 'matrix', 'score', 'combo', 'combo_3', 'combo_4'].forEach(key => {
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
                    case "nextPiece":
                        tetris.drawNextMatrix();
                        break;

                    // todo: random问题，保证各个客户端random结果一致
                    case "combo":
                    case "combo_3":
                    case "combo_4":
                        for (const [_, t] of Object.entries(this.tetrisManager)) {
                            if (t.player.teamId !== tetris.player.teamId) {
                                let valList = oo.random.getRandomByMinMaxList(0, 11, val);
                                for (let i = 0; i < valList.length; i += 2) {
                                    t.player.addRow(valList.slice(i, i + 2));
                                }
                            }
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
                case ActionType.ITEM_ADD_ROW:
                    for (let i = 0; i < valList.length; i += 2) {
                        to.player.addRow(valList.slice(i, i + 2));
                    }
                    break;
                case ActionType.ITEM_DEL_ROW:
                    for (let i = 0; i < valList[0]; i++) {
                        to.player.delRow();
                    }
                    break;
                case ActionType.ITEM_BOOM:
                    to.player.boom(valList);
                    break;
                case ActionType.ITEM_BUFF_DISTURB:
                    to.player.addDisturbBuff(valList[0]);
                    break;
                default:
                    break
            }
        });
    }

    onFrame(event: string, args: any) {
        let msg = args as OnFrameList;
        this.frameList = this.frameList.concat(msg.frameList);
    }

    // 可以控制速度
    update(deltaTime: number) {
        if (this.curFrame < this.frameList.length) {
            let frame = this.frameList[this.curFrame];
            this.process(frame);
            this.curFrame++;
        }
    }

    process(frame: OnFrame) {
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
            for (let i = offset; i >= 0; i--) {
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
        this.serialize(ActionType.DROP, this.touch(1, touchCounter, this.my.player.pos.y - 1));
    }

    onQuick() {
        this.serialize(ActionType.QUICK_DROP, [0])
    }
}
