import {_decorator, Component, instantiate, Label, Layout, Node, Prefab, Sprite, SpriteFrame} from 'cc';
import {Arena} from "db://assets/Script/example/Arena";
import {Player} from "db://assets/Script/example/Player";
import {Action, OnFrame_Player, UpdateFrame} from "db://assets/Script/example/proto/client";
import {ActionType} from "db://assets/Script/example/proto/consts";

const {ccclass, property} = _decorator;

@ccclass('Tetris')
export class Tetris extends Component {

    // 方块
    @property(Prefab)
    block: Prefab = undefined

    // 图片
    @property([SpriteFrame])
    spriteArray: SpriteFrame[] = [];

    // canvas
    @property(Node)
    canvas: Node

    // canvas上所有的节点
    @property(Node)
    itemArray: Node[][] = [];

    // top
    @property(Layout)
    top: Layout

    // 区域
    arena: Arena

    // player
    player: Player

    // 分数
    @property(Label)
    score: Label

    // tetris属性
    config: { id: number, my: boolean, w: number, h: number, bw: number, bh: number, draw0: boolean }

    onAdded(args: any) {
        // 创建
        this.config = {
            ...args,
            // 多少行，多少列
            w: 12,
            h: 20,
            // 方块的长宽
            bw: 28,
            bh: 28,
        };

        this.arena = new Arena(this.config.w, this.config.h);
        this.player = new Player(this.arena, this.config.id);

        // 玩家的所有事件
        ['pos', 'end', 'matrix', 'score'].forEach(key => {
            //
            this.player.events.on(key, (val) => {
                if (key !== "score") {
                    this.draw();
                } else {
                    this.updateScore(val);
                }
            })
        });

        // 所有区域的事件
        ["matrix"].forEach(key => {
            this.arena.events.on("matrix", (val) => {
                this.draw();
            })
        });
    }

    // 发送状态数据
    serialize(action: ActionType, val: any) {
        let buf = UpdateFrame.encode({action: {key: action, val: val}, }).finish();
        return buf;
    }

    // 解析状态数据
    unserialize(msg: OnFrame_Player) {
        let actionList = msg.actionList;
        actionList.forEach((action: Action)=>{
            let val = action.val;
            switch (action.key) {
                case ActionType.MOVE:
                    this.player.move(val);
                    break;
                case ActionType.DROP:
                    for(let i=0;i<val;i++) {
                        this.player.drop();
                    }
                    break;
                case ActionType.QUICK_DROP:
                    this.player.dropDown();
                    break;
                case ActionType.ROTATE:
                    this.player.rotate(val);
                    break;
                default:
                    break
            }
        });
    }


    updateScore(score: number) {
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
    }

    draw() {
        if (this.config.draw0) {
            this.fill0(this.arena.matrix);
        } else {
            this.fillNull(this.arena.matrix);
        }
        this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    update(deltaTime: number) {
        this.player.update(deltaTime);
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
                    if (oy > this.config.h || oy < 0 || ox > this.config.w || ox < 0) {
                        return;
                    }
                    this.itemArray[y + offset.y][x + offset.x].getComponent(Sprite).spriteFrame = this.spriteArray[value];
                }
            });
        });
    }

}
