import {_decorator} from 'cc';
import {Root} from "db://oops-framework/core/Root";
import {oops} from "db://oops-framework/core/Oops";
import {UIConfigData, UIID} from "db://assets/script/game/common/config/GameUIConfig";
import {gamechannel} from "db://assets/demo1/gamechannel";

const {ccclass, property} = _decorator;

@ccclass('Main')
export class Main extends Root {

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

