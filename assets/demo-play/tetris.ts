import {
    _decorator, Component, Node, Prefab, SpriteFrame, instantiate, Sprite,
    UITransform, Label, Layout
} from 'cc';
import {Arena} from "db://assets/demo-play/arena";
import {Player} from "db://assets/demo-play/player";
import {oops} from "db://oops-framework/core/Oops";
import {
    TableInfo_Player,
    TableInfo_PlayersEntry,
    UpdateState,
    Player as ProtoPlayer
} from "db://assets/demo1/proto/client";
import {gamechannel} from "db://assets/demo1/gamechannel";

const {ccclass, property} = _decorator;

@ccclass('tetris')
export class tetris extends Component {

    //
    // 方块
    @property(Prefab)
    block: Prefab = undefined

    //
    // 图片
    @property([SpriteFrame])
    spriteArray: SpriteFrame[] = [];

    //
    // canvas
    @property(Node)
    canvas: Node

    //
    // canvas上所有的节点
    @property(Node)
    itemArray: Node[][] = [];

    //
    // top
    @property(Layout)
    top: Layout

    //
    // 区域
    arena: Arena

    //
    // player
    player: Player

    //
    // 分数
    @property(Label)
    score: Label

    //
    // tetris属性
    config: { w: number, h: number, bw: number, bh: number, my: boolean }

    onAdded(args) {
        let uid = oops.storage.getUser();
        //
        // 创建
        oops.log.logView(args, "创建游戏");
        this.config = args;
        this.arena = new Arena(this.config.w, this.config.h);
        this.player = new Player(this.arena, uid);
        this.player.reset();

        //
        // 所有玩家的事件
        const pevents = ['pos', 'end', 'matrix'];
        pevents.forEach(key => {
            this.player.events.on(key, (val) => {
                let player: ProtoPlayer = {
                    pos: null,
                    score: 0,
                    matrix: null,
                };
                switch (key) {
                    case "pos":
                        player.pos = val;
                        break
                    case "matrix":
                        player.matrix = val;
                        break
                    case "score":
                        player.score = val;
                        this.score.string = `分数：${val}`;
                        break
                }
                //
                // 发送之
                let buf = UpdateState.encode(
                    {
                        fragment: "player",
                        arena: null,
                        player,
                        playerId: uid,
                        end: false
                    }).finish();
                gamechannel.gameNotify("r.updatestate", buf);

                if (key !== "pos") {
                    this.draw();
                }

            })

        })

        //
        // 所有区域的事件
        const aevents = ["matrix"];
        aevents.forEach(key => {
            this.arena.events.on("matrix", (matrix) => {
                //
                // 发送之
                let buf = UpdateState.encode(
                    {
                        fragment: "player",
                        arena: {
                            matrix: matrix,
                        },
                        player: null,
                        playerId: uid,
                        end: false
                    }).finish();
                gamechannel.gameNotify("r.updatestate", buf);
                this.draw();
            })
        })
    }

    onLoad() {

    }

    start() {
        const matrix = this.arena.matrix;

        const [w, h] = [this.config.bw * this.config.w, this.config.bh * this.config.h];
        this.canvas.getComponent(UITransform).setContentSize(w, h);
        matrix.forEach((row, y) => {
            this.itemArray[y] = []
            row.forEach((value, x) => {
                let item: Node = instantiate(this.block);
                this.canvas.addChild(item);
                // oops.log.logView({x: x * this.config.bw, y: h - y * this.config.bh}, "pos");
                item.setPosition(x * this.config.bw, h - (y + 1) * this.config.bh);
                item.getComponent(UITransform).setContentSize(this.config.bw - 1, this.config.bh - 1);
                this.itemArray[y][x] = item;
            })
        })

        //
        // 设置分数等的位置
        let node: Node = this.itemArray[0][0];
        let v3 = node.getPosition();
        this.score.fontSize = this.config.bw;
        this.top.node.setPosition(v3.x + this.config.bw * 2, v3.y + this.config.bw * 2);

        //
        // 设置初始分数
        this.player.events.emit("score", 0);

        this.draw();
    }

    draw() {
        if (this.config.my) {
            this.fill0(this.arena.matrix);
        } else {
            this.fillNull(this.arena.matrix);
        }
        this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    fill0(matrix) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                this.itemArray[y][x].getComponent(Sprite).spriteFrame = this.spriteArray[0];
            });
        });
    }

    fillNull(matrix) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                this.itemArray[y][x].getComponent(Sprite).spriteFrame = null;
            });
        });
    }

    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value != 0 && y + offset.y < this.config.h && x + offset.x < this.config.w) {
                    this.itemArray[y + offset.y][x + offset.x].getComponent(Sprite).spriteFrame = this.spriteArray[value];
                }

            });
        });
    }

    update(deltaTime: number) {
        if (this.config.my) {
            this.player.update(deltaTime);
        }
    }
}

