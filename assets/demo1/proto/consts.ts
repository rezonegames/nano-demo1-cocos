/* eslint-disable */

export const protobufPackage = "proto";

/** 该结构与consts结构一样，客户端服务器共用，只要定义就不能改变 */
export enum AccountType {
  DEVICEID = 0,
  WX = 1,
  FB = 2,
  GIT = 3,
  UNRECOGNIZED = -1,
}

export enum GameState {
  IDLE = 0,
  WAIT = 1,
  WAITREADY = 2,
  CANCEL = 3,
  COUNTDOWN = 4,
  GAMING = 5,
  SETTLEMENT = 6,
  UNRECOGNIZED = -1,
}

export enum GameSubState {
  SUBSTATE_NONE = 0,
  WAITREADY_PROFILE = 1,
  WAITREADY_COUNTDOWN = 2,
  WAITREADY_READYLIST = 3,
  COUNTDOWN_BEGIN = 4,
  GAME_BEGIN = 5,
  GAME_LOSE = 6,
  SETTLEMENT_BEGIN = 7,
  SETTLEMENT_END = 8,
  UNRECOGNIZED = -1,
}

export enum RoomType {
  ROOMTYPE_NONE = 0,
  QUICK = 1,
  MATCH = 2,
  UNRECOGNIZED = -1,
}

export enum TableType {
  TABLETYPE_NONE = 0,
  NORMAL = 1,
  HAPPY = 2,
  UNRECOGNIZED = -1,
}
