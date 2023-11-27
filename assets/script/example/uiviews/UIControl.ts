import {_decorator, instantiate, Label, Node, Prefab} from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {Action, LoadRes, OnFrame, OnFrame_Player, Room, TableInfo} from "db://assets/Script/example/proto/client";
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

    dropCounter: number = 0;
    dropInterval: number = 1;

    isInitialize: boolean = false;

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
                    for (const [uid, _] of Object.entries(tableInfo.players)) {
                        let name: string = parseInt(uid) == oo.storage.getUser() ? "my" : "enemy";
                        let t: Tetris = parent.getChildByName(name).getComponent("Tetris") as Tetris;
                        if (name == "my") {
                            this.my = t;
                        }
                        t.onAdded({uid, draw0: true});
                        this.tetrisManager[uid] = t;
                    }
                    oo.log.logView("", "res.ok");

                    let buf = LoadRes.encode({current:100}).finish();
                    channel.gameNotify("r.loadres", buf);
                });
                break
            case "2":
                break;
            default:
                break
        }
    }

    onDestroy() {
        super.onDestroy();
        EventMgr.removeEventListener("onFrame", this.onFrame, this);
        oo.log.logView("UIControl.onDestroy");
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
                    t.unserialize(player);
                }
            })
        }
    }

    update(deltaTime: number) {
        //
    }

    onLeft() {
        this.my.serialize(ActionType.MOVE, -1)
    }

    onRight() {
        this.my.serialize(ActionType.MOVE, 1)
    }

    onUp() {
        this.my.serialize(ActionType.ROTATE, 1)
    }

    onDrop() {
        this.my.serialize(ActionType.DROP, 1)
    }

    onQuick() {
        this.my.serialize(ActionType.QUICK_DROP, 0)
    }
}
