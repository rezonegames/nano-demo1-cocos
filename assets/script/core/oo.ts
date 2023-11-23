import {HttpRequest} from "./network/HttpRequest";
import {Logger} from "./common/Logger";
import {RandomManager} from "./common/RandomManager";
import {StorageManager} from "./common/StorageManager"
import {NetManager} from "./network/NetManager"

export class oo {
    static log = Logger;
    static http: HttpRequest = new HttpRequest();
    static random = RandomManager.instance;
    static storage: StorageManager = new StorageManager();
    static tcp: NetManager = new NetManager();
}