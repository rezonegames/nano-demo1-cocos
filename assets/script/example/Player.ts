import {EventTarget} from "cc";
import {Arena} from "db://assets/Script/example/Arena";
import {oo} from "db://assets/Script/core/oo";

export class Player {

    uid: number
    teamId: number
    pos: { x: number, y: number } // 位置
    matrix: Array<number>[] // 方块形状及位置
    score: number // 分数
    arena: Arena // arena
    events = new EventTarget; // 事件
    pieceList: number[]; // 在第1帧的时候初始化
    index: number;
    combo: number; // 连击
    disturbBuff: boolean; // 干扰buff

    constructor(arena: Arena, uid: number, teamId: number) {
        this.pos = {x: 0, y: 0};
        this.score = 0;
        this.arena = arena;
        this.uid = uid;
        this.index = 0;
        this.combo = 0;
        this.teamId = teamId;
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

    drop(): boolean {
        this.pos.y++;
        if (this.arena.collide(this)) {
            this.pos.y--;
            this.arena.merge(this);
            this.reset();
            let score = this.arena.sweep();
            this.checkCombo(score);
            this.score += score
            this.events.emit('score', this.score);
            return false;
        }
        this.events.emit('pos', this.pos);
        return true;
    }

    addDisturbBuff(second: number) {
        this.disturbBuff = true;
        setTimeout(()=>{
            this.disturbBuff = false;
        }, second*1000)
    }

    checkCombo(score: number) {
        if (score == 0) {
            this.combo = 0;
            return;
        }
        this.combo++;
        if (this.combo >= 2) {
            this.events.emit('combo', this.combo);
        }
    }

    dropDown() {
        while (this.drop()) {
        }
    }

    move(dir) {
        this.pos.x += dir;
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
            return;
        }
        this.events.emit('pos', this.pos);
    }

    reset() {
        const pieces = 'ILJOTSZ';
        this.matrix = this.createPiece(pieces[this.pieceList[this.index]]);
        this.index++;
        if (this.index > this.pieceList.length - 1) {
            this.index = 0;
        }
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
            (this.matrix[0].length / 2 | 0);
        this.events.emit('pos', this.pos);
        this.events.emit('matrix', this.matrix);
        if (this.arena.collide(this)) {
            this.events.emit('end', null);
        }
    }

    rotate(dir) {
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

}