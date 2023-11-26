import {_decorator, instantiate, Label, Node, Prefab} from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {Room, TableInfo} from "db://assets/Script/example/proto/client";
import {oo} from "db://assets/Script/core/oo";
import {Tetris} from "db://assets/Script/example/Tetris";
import {ActionType} from "db://assets/Script/example/proto/consts";

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
    dropInterval: number = 0;

    public onOpen(fromUI: number, ...args) {
        super.onOpen(fromUI, ...args);

        let tableInfo = args[0] as TableInfo;
        let room: Room = tableInfo.room;
        this.title.string = room.name

        oo.random.isClient = true;
        oo.random.isGlobal = true;
        oo.random.setSeed(tableInfo.randSeed);

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
                        let isMy: boolean = parseInt(uid) == oo.storage.getUser();
                        let t: Tetris;
                        if (isMy) {
                            t = parent.getChildByName("my").getComponent("Tetris") as Tetris;
                            t.onAdded({id:uid, draw0:true});
                            this.my = t;

                            t.player.reset();
                        } else {
                            t = parent.getChildByName("enemy").getComponent("Tetris") as Tetris;
                            t.onAdded({id:uid, draw0:true});
                        }

                        this.tetrisManager[uid] = t;
                    }

                });
                break
            case "2":
                break;
            default:
                break
        }
    }

    update(deltaTime: number) {
        this.dropCounter += deltaTime;
        if (this.my && this.dropCounter > this.dropInterval) {
            this.my.serialize(ActionType.DROP, 1);
        }
    }

    onLeft() {
        this.my.serialize(ActionType.MOVE, -1);
    }

    onRight() {
        this.my.serialize(ActionType.MOVE, 1);
    }

    onUp() {
        this.my.serialize(ActionType.ROTATE, 1);
    }

    onDrop() {
        this.my.serialize(ActionType.DROP, 1);
    }

    onQuick() {
        this.my.serialize(ActionType.QUICK_DROP, 0);
    }
}
