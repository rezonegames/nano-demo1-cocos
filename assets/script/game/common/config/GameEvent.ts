// 游戏事件
export enum GameEvent {
    //
    // 游戏服务器连接成功
    GameServerConnected = "GameServerConnected",

    //
    // header数据变化
    GameHeaderEvent = "GameHeaderEvent",

    //
    // 大厅事件
    HallUpdateRoomListEvent = "HallUpdateRoomListEvent",

    //
    // table事件
    TableEvent = "TableEvent",

    //
    // 玩家事件
    PlayerUpdateEvent = "PlayerUpdateEvent"
}