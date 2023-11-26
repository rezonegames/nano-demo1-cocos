import { _decorator } from "cc";
import {UIView} from "db://assets/Script/core/ui/UIView";
import {uiManager} from "db://assets/Script/core/ui/UIManager";

const {ccclass, property} = _decorator;

@ccclass
export default class UISettlement extends UIView {

    public onOpen(fromUI: number, ...args) {
        super.onOpen(fromUI, ...args);
    }
    
}
