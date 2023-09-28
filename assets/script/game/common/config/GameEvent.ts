/*
 * @Author: dgflash
 * @Date: 2021-11-23 15:28:39
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 16:42:00
 */

// 游戏事件
export enum GameEvent {
    // 游戏服务器连接成功
    GameServerConnected = "GameServerConnected",
    // header数据变化
    GameHeaderEvent = "GameHeaderEvent",
    // 大厅事件
    HallUpdateRoomListEvent = "HallUpdateRoomListEvent",
    // 游戏事件
    GameWaitReadyEvent = "GameWaitReadyEvent",
    // 进入游戏的倒计时
    GameCountDownEvent = "GameCountDownEvent",
}