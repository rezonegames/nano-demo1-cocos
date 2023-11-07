import {_decorator} from 'cc';
import {Root} from "db://oops-framework/core/Root";
import {oops} from "db://oops-framework/core/Oops";
import {UIConfigData, UIID} from "db://assets/script/game/common/config/GameUIConfig";
import {gamechannel} from "db://assets/demo1/gamechannel";

const {ccclass, property} = _decorator;

@ccclass('Main')
export class Main extends Root {

    // todo：游戏开始前，把所有的资源全部加载进来
    onLoad() {
        super.onLoad();
        gamechannel.gameCreate();
    }

    start() {
    }

    update(deltaTime: number) {

    }

    protected initGui() {
        oops.gui.init(UIConfigData);
        oops.gui.open(UIID.Header);
        oops.gui.open(UIID.Login);
    }
}

