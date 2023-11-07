import {_decorator, Component, Node, Prefab, SpriteFrame, instantiate, Sprite, UITransform, Label, Graphics, Color} from 'cc';
import {Arena} from "db://assets/demo-play/arena";
import {Player} from "db://assets/demo-play/player";
import {oops} from "db://oops-framework/core/Oops";

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
    // 整个绘制区域
    @property(Node)
    itemArray: Node[][] = [];

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
        //
        // 创建
        oops.log.logView(args, "创建游戏");
        this.config = args;
        this.arena = new Arena(this.config.w, this.config.h);
        this.player = new Player(this.arena);
        this.player.reset();

        this.player.events.on("score", (score) => {
            this.score.string = `分数：${score}`;
        })

        this.player.events.on("pos", (pos) => {
            this.draw();
        })

        this.player.events.on("matrix", (matrix) => {
            this.draw();
        })

        this.arena.events.on("matrix", (matrix) => {
            this.draw();
        })
    }

    onLoad() {

    }

    start() {
        const matrix = this.arena.matrix;
        matrix.forEach((row, y) => {
            this.itemArray[y] = []
            row.forEach((value, x) => {
                let item: Node = instantiate(this.block);
                this.node.addChild(item);
                item.setPosition(x * this.config.bw, this.config.bh * this.config.h - y * this.config.bh);
                item.getComponent(UITransform).setContentSize(this.config.bw-1, this.config.bh-1);
                this.itemArray[y][x] = item;
            })
        })

        //
        // 设置分数等的位置
        let node: Node = this.itemArray[0][0];
        let v3 = node.getPosition();
        this.score.fontSize = this.config.bw;
        this.score.node.setPosition(v3.x + this.config.bw*2, v3.y + this.config.bw*2);

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
        this.player.update(deltaTime);
        // this.draw();
    }
}

