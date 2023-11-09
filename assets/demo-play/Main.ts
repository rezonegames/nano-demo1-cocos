import {_decorator, Component, Node, Prefab, instantiate} from 'cc';
import {Root} from "db://oops-framework/core/Root";
import ClipboardJS from "clipboard";
import {oops} from "db://oops-framework/core/Oops";
import {LayerType, UIConfig} from "db://oops-framework/core/gui/layer/LayerManager";
import {UIID} from "db://assets/script/game/common/config/GameUIConfig";
import {tetris} from "db://assets/demo-play/tetris";

import {UITransform, Label} from "cc";
import {Player} from "db://assets/demo-play/player";

const {ccclass, property} = _decorator;

@ccclass('Main')
export class Main extends Root {

    myPlayer: Player

    start() {
        // let v = ClipboardJS.copy("xx");
        // oops.log.logView(v, "test");
        oops.res.load("demo-play/tetris", Prefab, (err: Error | null, prefab: Prefab) => {
            if (err) {
                oops.log.logView(err, "加载失败");
                return;
            }
            //
            // 玩家自己
            this.myPlayer = this.createTetris(prefab, {
                w: 12,
                h: 20,
                bw: 63,
                bh: 63,
                my: true,
            }, {x: -200, y: 0})

            //
            // 其他人
            this.createTetris(prefab, {
                w: 12,
                h: 20,
                bw: 22,
                bh: 22,
                my: false,
            }, {x: 400, y: 300})

            //
            // 其他人
            this.createTetris(prefab, {
                w: 12,
                h: 20,
                bw: 22,
                bh: 22
            }, {x: 400, y: -400})

        });

    }

    createTetris(prefab: Prefab, config: any, offset: { x: number, y: number }): Player {
        let node: Node = instantiate(prefab);
        let t: tetris = node.getComponent("tetris") as tetris;
        t.onAdded(config);
        let w = config.w * config.bw;
        let h = config.h * config.bh;
        this.gui.addChild(node);
        node.setPosition(-w / 2 + offset.x, -h / 2 + offset.y);
        return t.player;
    }

    protected initGui() {

    }

    update(deltaTime: number) {

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

