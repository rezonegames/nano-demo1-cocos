import {_decorator, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, Widget} from 'cc';
import {Arena} from "db://assets/Script/example/Arena";
import {Player} from "db://assets/Script/example/Player";

const {ccclass, property} = _decorator;

@ccclass('Tetris')
export class Tetris extends Component {

    // 方块
    @property(Prefab)
    block: Prefab

    // 图片
    @property([SpriteFrame])
    spriteArray: SpriteFrame[]

    // canvas
    @property(Node)
    canvas: Node

    // canvas上所有的节点
    @property(Node)
    itemArray: Node[][] = [];

    // top
    @property(Widget)
    top: Widget

    // 区域
    arena: Arena

    // player
    player: Player

    // 分数
    @property(Label)
    score: Label

    // tetris属性
    config: { w: number, h: number, bw: number, bh: number } = {
        w: 12,
        h: 20,
        bw: 28,
        bh: 28,
    };

    draw0: boolean = true; // 当多人一起pk时，节省资源，不画0

    updateScore(score: number) {
        this.score.string = `分数：${score}`;
    }

    onAdded(args: any) {
        // 创建
        this.arena = new Arena(this.config.w, this.config.h);
        this.player = new Player(this.arena, args.uid, args.teamId);
    }

    start() {
        const matrix = this.arena.matrix;
        const [w, h, bw, bh] = [this.config.w * this.config.bw, this.config.h * this.config.bh, this.config.bw, this.config.bh];
        matrix.forEach((row, y) => {
            this.itemArray[y] = []
            row.forEach((value, x) => {
                let item: Node = instantiate(this.block);
                this.canvas.addChild(item);
                item.setPosition(-w / 2 + x * bw + bw / 2, h / 2 - (y + 1) * this.config.bh + bh / 2);
                this.itemArray[y][x] = item;
            })
        });
        this.updateScore(0);
    }

    draw() {
        this.fillNull(this.arena.matrix);
        this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
        this.drawShadowMatrix();
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    update(deltaTime: number) {
        // this.player.update(deltaTime);
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
                    if (oy > this.config.h-1 || oy < 0 || ox > this.config.w-1 || ox < 0) {
                        return;
                    }
                    this.itemArray[y + offset.y][x + offset.x].getComponent(Sprite).spriteFrame = this.spriteArray[value];
                }
            });
        });
    }

    // 画影子
    drawShadowMatrix() {
        let matrix = this.player.matrix;
        let offset = {x: this.player.pos.x, y: this.player.pos.y};
        while (!this.arena._collideMatrix(this.player.matrix, offset)) {
            offset.y++;
        }
        offset.y--

        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value != 0) {
                    const [oy, ox] = [y + offset.y, x + offset.x];
                    if (oy > this.config.h-1 || oy < 0 || ox > this.config.w-1 || ox < 0) {
                        return;
                    }
                    this.itemArray[y + offset.y][x + offset.x].getComponent(Sprite).spriteFrame = this.spriteArray[1];
                }
            });
        });
    }

}

