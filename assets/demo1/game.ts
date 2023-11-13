import {_decorator, Component, Node, Label, Prefab, instantiate, Layout} from 'cc';
import {oops} from "db://oops-framework/core/Oops";
import {GameEvent} from "db://assets/script/game/common/config/GameEvent";
import {GameStateResp, Room, TableInfo, TableInfo_Player} from "db://assets/demo1/proto/client";
import {TableState} from "db://assets/demo1/proto/consts";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";
import {Player} from "db://assets/demo-play/player";
import {tetris} from "db://assets/demo-play/tetris";

const {ccclass, property} = _decorator;

@ccclass('game')
export class game extends Component {

    @property(Label)
    labCountDown: Label

    @property(Label)
    title: Label

    @property(Prefab)
    tetris: Prefab

    //
    // 玩家列表
    tableInfo: TableInfo

    //
    // 控制玩家
    myPlayer: Player

    //
    // tetris管理器
    tetrisManager: { [key: number]: tetris }

    onAdded(args: any) {
    }

    start() {
        this.title.string = "";
        oops.message.on(GameEvent.TableEvent, this.onTableInfo, this);
    }

    protected onDestroy() {
        oops.message.off(GameEvent.TableEvent, this.onTableInfo, this);
    }

    update(deltaTime: number) {

    }

    onTableInfo(event: string, args: any) {
        let gameState = args as GameStateResp;
        this.tableInfo = gameState.tableInfo;
        this.tetrisManager = {};
        switch (this.tableInfo.tableState) {
            case TableState.COUNTDOWN:
                if (this.tableInfo.countDown == 0) {
                    this.labCountDown.node.active = false;
                    let room: Room = this.tableInfo.room;
                    this.title.string = room.name;
                    switch (room.roomId) {
                        //
                        // 1v1
                        case "1":
                            oops.res.load("demo1/game1v1", Prefab, (err: Error | null, prefab: Prefab) => {
                                if (err) {
                                    oops.log.logView(err, "加载失败");
                                    return;
                                }

                                let parent: Node = instantiate(prefab);
                                this.node.addChild(parent);
                                //
                                // 创建tetirs
                                for (const [k, v] of Object.entries(this.tableInfo.players)) {
                                    let isMy: boolean = parseInt(k) == oops.storage.getUser();
                                    let player: Player;
                                    if (isMy) {
                                        let my: Node = parent.getChildByName("my");
                                        player = this.createTetris({my: isMy, draw0: true}, my);
                                        this.myPlayer = player;
                                    } else {
                                        let enemy: Node = parent.getChildByName("enemy");
                                        player = this.createTetris({my: isMy, draw0: true}, enemy);
                                    }
                                    this.tetrisManager[k] = player;
                                }

                            });
                            break
                    }

                } else {
                    this.labCountDown.string = `游戏马上开始了：${this.tableInfo.countDown}`;
                }
                break;

            case TableState.SETTLEMENT:
                oops.gui.open(UIID.Settlement, gameState);
                break;
        }
    }

    createTetris(config: any, parent: Node): Player {
        let node: Node = instantiate(this.tetris);
        let t: tetris = node.getComponent("tetris") as tetris;
        t.onAdded(config);
        parent.addChild(node);
        return t.player;
    }

    onLeft() {
        this.myPlayer.move(-1);
    }

    onRight() {
        this.myPlayer.move(1);
    }

    onUp() {
        this.myPlayer.rotate(1);
    }

    onDrop() {
        this.myPlayer.drop();
    }

    onQuick() {
        this.myPlayer.dropDown();
    }
}

