import {
    _decorator, Component, Node, Prefab, SpriteFrame, instantiate, Sprite,
    UITransform, Label, Layout
} from 'cc';
import {Arena} from "db://assets/demo-play/arena";
import {Player} from "db://assets/demo-play/player";
import {oops} from "db://oops-framework/core/Oops";
import {
    UpdateState,
    Arena as ProtoArena,
    Player as ProtoPlayer, Array2, Row, State
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
    config: { id: number, my: boolean, w: number, h: number, bw: number, bh: number, draw0: boolean }

    //
    // 资源是否都初始化完成
    isInit: boolean

    onAdded(args) {
        //
        // 创建
        oops.log.logView(args, "创建游戏");
        this.config = {
            ...args,
            //
            // 多少行，多少列
            w: 12,
            h: 20,
            //
            // 方块的长宽
            bw: 28,
            bh: 28,
        };

        this.arena = new Arena(this.config.w, this.config.h);
        this.player = new Player(this.arena, this.config.id);

        //
        // 玩家的所有事件
        ['pos', 'end', 'matrix', 'score'].forEach(key => {
            //
            this.player.events.on(key, (val) => {
                // oops.log.logView(key, "player state");

                gamechannel.gameNotify("r.updatestate", this.serialize("player", key, val));
                if (key !== "score") {
                    this.draw();
                } else {
                    this.updateScore(val);
                }
            })
        });

        //
        // 所有区域的事件
        ["matrix"].forEach(key => {
            this.arena.events.on("matrix", (val) => {
                //
                // 发送之
                gamechannel.gameNotify("r.updatestate", this.serialize("arena", key, val));
                this.draw();
            })
        });
    }

    //
    // 发送状态数据
    serialize(fragment: string, type: string, val: any): Uint8Array {
        //
        // 转为protobuf
        const convMatrix = (matrix: Array<number>[]): Array2 => {
            if (!matrix) {
                return undefined;
            }
            let pmatrix: Array2 = {rows: []};
            matrix.forEach(row => {
                pmatrix.rows.push({values: row})
            })
            return pmatrix;
        }

        let msg: UpdateState = {
            arena: undefined, player: undefined,
            fragment: fragment,
            playerId: this.player.id,
            end: this.player.end,
            resOK: false,
        }

        switch (fragment) {
            case "player":
                let player: ProtoPlayer = {
                    matrix: undefined, pos: undefined,
                    score: 0
                };
                switch (type) {
                    case "pos":
                        player.pos = val;
                        break
                    case "matrix":
                        player.matrix = convMatrix(val);
                        break
                    case "score":
                        player.score = val;
                        break
                    case "end":
                        msg.end = true;
                    case "res":
                        msg.resOK = true;
                        break
                }
                msg.player = player;
                break
            case "arena":
                let arena: ProtoArena = {
                    matrix: undefined
                };
                switch (type) {
                    case "matrix":
                        arena.matrix = convMatrix(val);
                        break
                }
                msg.arena = arena;
                break
        }
        let buf = UpdateState.encode(msg).finish();
        return buf;
    }

    //
    // 解析状态数据
    unserialize(state: UpdateState) {
        //
        // proto 到 二维数组
        const convMatrix = (matrix: Array2): Array<number>[] => {
            if (!matrix) {
                return undefined;
            }
            let pmatrix: Array<number>[] = [];
            matrix.rows.forEach(row => {
                pmatrix.push(row.values);
            })
            return pmatrix;
        }

        oops.log.logView(state, `unserialize ${this.player.id}`);
        //
        // arena区域
        let arena: ProtoArena = state.arena;
        if (arena) {
            this.arena.matrix = convMatrix(arena.matrix);
        }
        //
        // player
        let player: ProtoPlayer = state.player;
        if (player) {
            if (player.pos) {
                this.player.pos = player.pos;
            }
            if (player.matrix) {
                this.player.matrix = convMatrix(player.matrix);
            }
            if (player.score != 0) {
                this.updateScore(player.score);
            }
        }
        this.draw();
    }

    updateScore(score: number) {
        // oops.log.logView(score, "score");
        this.score.string = `分数：${score}`;
    }

    start() {
        const matrix = this.arena.matrix;
        const [w, h] = [this.config.w * this.config.bw, this.config.h * this.config.bh];
        matrix.forEach((row, y) => {
            this.itemArray[y] = []
            row.forEach((value, x) => {
                let item: Node = instantiate(this.block);
                this.canvas.addChild(item);
                item.setPosition(-w / 2 + x * this.config.bw, h / 2 - (y + 1) * this.config.bh);
                this.itemArray[y][x] = item;
            })
        })
        gamechannel.gameNotify("r.updatestate", this.serialize("player", "res", null));
    }

    draw() {
        if (!this.isInit) return;
        if (this.config.draw0) {
            this.fill0(this.arena.matrix);
        } else {
            this.fillNull(this.arena.matrix);
        }
        this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
        if(this.player.matrix) {
            this.drawMatrix(this.player.matrix, this.player.pos);
        }
    }

    update(deltaTime: number) {
        if (!this.isInit) return;
        if (this.config.my) {
            this.player.update(deltaTime);
        }
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
                if (value != 0) {
                    const [oy, ox] = [y + offset.y, x + offset.x];
                    // oops.log.logView({oy, ox}, "drawMatrix pos");
                    if (oy > this.config.h || oy < 0 || ox > this.config.w || ox < 0) {
                        return;
                    }
                    this.itemArray[y + offset.y][x + offset.x].getComponent(Sprite).spriteFrame = this.spriteArray[value];
                }

            });
        });
    }

}

