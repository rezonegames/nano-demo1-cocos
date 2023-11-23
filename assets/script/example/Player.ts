import {EventTarget} from "cc";
import {Arena} from "db://assets/Script/example/Arena";

export class Player {

    // 位置
    pos: { x: number, y: number }

    // 方块形状及位置
    matrix: Array<number>[]

    // 分数
    score: number

    // arena
    arena: Arena

    // 时间计数器
    dropCounter: any

    // 下降速度，todo：可以设置
    dropInterval: number

    DROP_SLOW = 1
    DROP_FAST = 0.05

    // id
    id: number

    //
    // 事件
    events = new EventTarget;

    // 是否结束
    end: boolean

    constructor(arena: Arena, id: number) {
        this.pos = {x: 0, y: 0};
        this.score = 0;
        this.dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;
        this.arena = arena;
        this.id = id;
        this.end = false;
    }

    createPiece(type) {
        if (type === 'T') {
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    drop() {
        if (this.end) return;
        this.pos.y++;
        this.dropCounter = 0;
        if (this.arena.collide(this)) {
            this.pos.y--;
            this.arena.merge(this);
            this.reset();
            this.score += this.arena.sweep();
            this.events.emit('score', this.score);
            return;
        }
        this.events.emit('pos', this.pos);
    }

    dropDown() {
        if (this.end) return;
        console.log("dropdown")
        while (true) {
            this.pos.y++;
            this.dropCounter = 0;
            if (this.arena.collide(this)) {
                this.pos.y--;
                this.arena.merge(this);
                this.events.emit('pos', this.pos);
                this.reset();
                this.score += this.arena.sweep();
                this.events.emit('score', this.score);
                return;
            }
        }
    }


    move(dir) {
        if (this.end) return;
        this.pos.x += dir;
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
            return;
        }
        this.events.emit('pos', this.pos);
    }

    reset() {
        const pieces = 'ILJOTSZ';
        this.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
            (this.matrix[0].length / 2 | 0);
        this.events.emit('pos', this.pos);
        this.events.emit('matrix', this.matrix);
        if (this.arena.collide(this)) {
            this.end = true;
            this.events.emit('end', null);
        }
    }

    rotate(dir) {
        if (this.end) return;
        const pos = this.pos.x;
        let offset = 1;
        this._rotateMatrix(this.matrix, dir);
        while (this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this._rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
        this.events.emit('matrix', this.matrix);
    }

    _rotateMatrix(matrix, dir) {
        if (this.end) return;
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    update(deltaTime) {
        if (this.end) return;
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }

}