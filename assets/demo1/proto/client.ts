/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal.js";
import { GameState, TableState } from "./consts.js";
import { ErrorCode } from "./error.js";

export const protobufPackage = "proto";

export interface Ping {
}

export interface Pong {
  ts: number;
}

export interface LoginToGame {
  userId: number;
}

export interface Profile {
  name: string;
  coin: number;
  userId: number;
  updatedAt: number;
}

export interface LoginToGameResp {
  code: ErrorCode;
  player: Profile | undefined;
  roomList: Room[];
  roomId: string;
  tableId: string;
}

export interface RegisterGameReq {
  name: string;
  accountId: string;
}

export interface Room {
  roomId: string;
  pvp: number;
  name: string;
  minCoin: number;
}

export interface GetRoomListResp {
  code: ErrorCode;
  roomList: Room[];
}

/** game服务 */
export interface Join {
  roomId: string;
}

export interface JoinResp {
  code: ErrorCode;
}

export interface Cancel {
}

export interface CancelResp {
  code: ErrorCode;
}

export interface Ready {
}

export interface ReadyResp {
  code: ErrorCode;
}

export interface LeaveResp {
  code: ErrorCode;
}

/** 在每一个步骤，下发游戏状态 */
export interface GameStateResp {
  code: ErrorCode;
  errMsg: string;
  state: GameState;
  tableInfo: TableInfo | undefined;
  roomList: Room[];
}

/** TwoArray 二维数组[[0,0],[0,0]] */
export interface Row {
  values: number[];
}

export interface Array2 {
  rows: Row[];
}

/** Pos 坐标 */
export interface Pos {
  x: number;
  y: number;
}

/** 玩家数据 */
export interface Player {
  matrix: Array2 | undefined;
  pos: Pos | undefined;
  score: number;
}

/** 区域数据 */
export interface Arena {
  matrix: Array2 | undefined;
}

export interface State {
  arena: Arena | undefined;
  player: Player | undefined;
}

/** UpdateState 玩家上传数据，包括arena数据和player数据 */
export interface UpdateState {
  /** arena|player */
  fragment: string;
  /** pos|matrix|score */
  player:
    | Player
    | undefined;
  /** arena */
  arena:
    | Arena
    | undefined;
  /**  */
  playerId: number;
  end: boolean;
  resOK: boolean;
}

/** 下发桌子信息 */
export interface TableInfo {
  tableId: string;
  tableState: TableState;
  players: { [key: number]: TableInfo_Player };
  loseTeams: { [key: number]: number };
  waiter: TableInfo_Waiter | undefined;
  room: Room | undefined;
}

export interface TableInfo_Player {
  teamId: number;
  state: State | undefined;
  end: boolean;
  score: number;
  profile: Profile | undefined;
  resOK: boolean;
}

export interface TableInfo_Waiter {
  readys: { [key: number]: number };
  countDown: number;
}

export interface TableInfo_Waiter_ReadysEntry {
  key: number;
  value: number;
}

export interface TableInfo_PlayersEntry {
  key: number;
  value: TableInfo_Player | undefined;
}

export interface TableInfo_LoseTeamsEntry {
  key: number;
  value: number;
}

function createBasePing(): Ping {
  return {};
}

export const Ping = {
  encode(_: Ping, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Ping {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePing();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBasePong(): Pong {
  return { ts: 0 };
}

export const Pong = {
  encode(message: Pong, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ts !== 0) {
      writer.uint32(8).int64(message.ts);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Pong {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePong();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.ts = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseLoginToGame(): LoginToGame {
  return { userId: 0 };
}

export const LoginToGame = {
  encode(message: LoginToGame, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userId !== 0) {
      writer.uint32(8).int64(message.userId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LoginToGame {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLoginToGame();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.userId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseProfile(): Profile {
  return { name: "", coin: 0, userId: 0, updatedAt: 0 };
}

export const Profile = {
  encode(message: Profile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.coin !== 0) {
      writer.uint32(16).int32(message.coin);
    }
    if (message.userId !== 0) {
      writer.uint32(24).int64(message.userId);
    }
    if (message.updatedAt !== 0) {
      writer.uint32(80).int64(message.updatedAt);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Profile {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProfile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.coin = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.userId = longToNumber(reader.int64() as Long);
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.updatedAt = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseLoginToGameResp(): LoginToGameResp {
  return { code: 0, player: undefined, roomList: [], roomId: "", tableId: "" };
}

export const LoginToGameResp = {
  encode(message: LoginToGameResp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    if (message.player !== undefined) {
      Profile.encode(message.player, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.roomList) {
      Room.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.roomId !== "") {
      writer.uint32(34).string(message.roomId);
    }
    if (message.tableId !== "") {
      writer.uint32(42).string(message.tableId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LoginToGameResp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLoginToGameResp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.player = Profile.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.roomList.push(Room.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.roomId = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.tableId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseRegisterGameReq(): RegisterGameReq {
  return { name: "", accountId: "" };
}

export const RegisterGameReq = {
  encode(message: RegisterGameReq, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.accountId !== "") {
      writer.uint32(18).string(message.accountId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterGameReq {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegisterGameReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.accountId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseRoom(): Room {
  return { roomId: "", pvp: 0, name: "", minCoin: 0 };
}

export const Room = {
  encode(message: Room, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.roomId !== "") {
      writer.uint32(10).string(message.roomId);
    }
    if (message.pvp !== 0) {
      writer.uint32(16).int32(message.pvp);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.minCoin !== 0) {
      writer.uint32(32).int32(message.minCoin);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Room {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRoom();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.roomId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.pvp = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.minCoin = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseGetRoomListResp(): GetRoomListResp {
  return { code: 0, roomList: [] };
}

export const GetRoomListResp = {
  encode(message: GetRoomListResp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    for (const v of message.roomList) {
      Room.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetRoomListResp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetRoomListResp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.roomList.push(Room.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseJoin(): Join {
  return { roomId: "" };
}

export const Join = {
  encode(message: Join, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.roomId !== "") {
      writer.uint32(10).string(message.roomId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Join {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJoin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.roomId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseJoinResp(): JoinResp {
  return { code: 0 };
}

export const JoinResp = {
  encode(message: JoinResp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): JoinResp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJoinResp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseCancel(): Cancel {
  return {};
}

export const Cancel = {
  encode(_: Cancel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Cancel {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCancel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseCancelResp(): CancelResp {
  return { code: 0 };
}

export const CancelResp = {
  encode(message: CancelResp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CancelResp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCancelResp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseReady(): Ready {
  return {};
}

export const Ready = {
  encode(_: Ready, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Ready {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReady();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseReadyResp(): ReadyResp {
  return { code: 0 };
}

export const ReadyResp = {
  encode(message: ReadyResp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReadyResp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReadyResp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseLeaveResp(): LeaveResp {
  return { code: 0 };
}

export const LeaveResp = {
  encode(message: LeaveResp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LeaveResp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLeaveResp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseGameStateResp(): GameStateResp {
  return { code: 0, errMsg: "", state: 0, tableInfo: undefined, roomList: [] };
}

export const GameStateResp = {
  encode(message: GameStateResp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    if (message.errMsg !== "") {
      writer.uint32(18).string(message.errMsg);
    }
    if (message.state !== 0) {
      writer.uint32(24).int32(message.state);
    }
    if (message.tableInfo !== undefined) {
      TableInfo.encode(message.tableInfo, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.roomList) {
      Room.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameStateResp {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameStateResp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.code = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.errMsg = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.tableInfo = TableInfo.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.roomList.push(Room.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseRow(): Row {
  return { values: [] };
}

export const Row = {
  encode(message: Row, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Row {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRow();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.values.push(reader.int32());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.values.push(reader.int32());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseArray2(): Array2 {
  return { rows: [] };
}

export const Array2 = {
  encode(message: Array2, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.rows) {
      Row.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Array2 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArray2();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.rows.push(Row.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBasePos(): Pos {
  return { x: 0, y: 0 };
}

export const Pos = {
  encode(message: Pos, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(8).uint32(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(16).uint32(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Pos {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePos();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.x = reader.uint32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.y = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBasePlayer(): Player {
  return { matrix: undefined, pos: undefined, score: 0 };
}

export const Player = {
  encode(message: Player, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matrix !== undefined) {
      Array2.encode(message.matrix, writer.uint32(10).fork()).ldelim();
    }
    if (message.pos !== undefined) {
      Pos.encode(message.pos, writer.uint32(18).fork()).ldelim();
    }
    if (message.score !== 0) {
      writer.uint32(24).uint32(message.score);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Player {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.matrix = Array2.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.pos = Pos.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.score = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseArena(): Arena {
  return { matrix: undefined };
}

export const Arena = {
  encode(message: Arena, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matrix !== undefined) {
      Array2.encode(message.matrix, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Arena {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArena();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.matrix = Array2.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseState(): State {
  return { arena: undefined, player: undefined };
}

export const State = {
  encode(message: State, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.arena !== undefined) {
      Arena.encode(message.arena, writer.uint32(10).fork()).ldelim();
    }
    if (message.player !== undefined) {
      Player.encode(message.player, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): State {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.arena = Arena.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.player = Player.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseUpdateState(): UpdateState {
  return { fragment: "", player: undefined, arena: undefined, playerId: 0, end: false, resOK: false };
}

export const UpdateState = {
  encode(message: UpdateState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fragment !== "") {
      writer.uint32(10).string(message.fragment);
    }
    if (message.player !== undefined) {
      Player.encode(message.player, writer.uint32(18).fork()).ldelim();
    }
    if (message.arena !== undefined) {
      Arena.encode(message.arena, writer.uint32(26).fork()).ldelim();
    }
    if (message.playerId !== 0) {
      writer.uint32(32).int64(message.playerId);
    }
    if (message.end === true) {
      writer.uint32(80).bool(message.end);
    }
    if (message.resOK === true) {
      writer.uint32(88).bool(message.resOK);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.fragment = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.player = Player.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.arena = Arena.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.playerId = longToNumber(reader.int64() as Long);
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.end = reader.bool();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.resOK = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseTableInfo(): TableInfo {
  return { tableId: "", tableState: 0, players: {}, loseTeams: {}, waiter: undefined, room: undefined };
}

export const TableInfo = {
  encode(message: TableInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tableId !== "") {
      writer.uint32(10).string(message.tableId);
    }
    if (message.tableState !== 0) {
      writer.uint32(16).int32(message.tableState);
    }
    Object.entries(message.players).forEach(([key, value]) => {
      TableInfo_PlayersEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    Object.entries(message.loseTeams).forEach(([key, value]) => {
      TableInfo_LoseTeamsEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    if (message.waiter !== undefined) {
      TableInfo_Waiter.encode(message.waiter, writer.uint32(42).fork()).ldelim();
    }
    if (message.room !== undefined) {
      Room.encode(message.room, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TableInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tableId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.tableState = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          const entry3 = TableInfo_PlayersEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.players[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = TableInfo_LoseTeamsEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.loseTeams[entry4.key] = entry4.value;
          }
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.waiter = TableInfo_Waiter.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.room = Room.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseTableInfo_Player(): TableInfo_Player {
  return { teamId: 0, state: undefined, end: false, score: 0, profile: undefined, resOK: false };
}

export const TableInfo_Player = {
  encode(message: TableInfo_Player, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.teamId !== 0) {
      writer.uint32(8).int32(message.teamId);
    }
    if (message.state !== undefined) {
      State.encode(message.state, writer.uint32(18).fork()).ldelim();
    }
    if (message.end === true) {
      writer.uint32(24).bool(message.end);
    }
    if (message.score !== 0) {
      writer.uint32(32).int32(message.score);
    }
    if (message.profile !== undefined) {
      Profile.encode(message.profile, writer.uint32(42).fork()).ldelim();
    }
    if (message.resOK === true) {
      writer.uint32(48).bool(message.resOK);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TableInfo_Player {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableInfo_Player();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.teamId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.state = State.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.end = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.score = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.profile = Profile.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.resOK = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseTableInfo_Waiter(): TableInfo_Waiter {
  return { readys: {}, countDown: 0 };
}

export const TableInfo_Waiter = {
  encode(message: TableInfo_Waiter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.readys).forEach(([key, value]) => {
      TableInfo_Waiter_ReadysEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    if (message.countDown !== 0) {
      writer.uint32(48).int32(message.countDown);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TableInfo_Waiter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableInfo_Waiter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = TableInfo_Waiter_ReadysEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.readys[entry4.key] = entry4.value;
          }
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.countDown = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseTableInfo_Waiter_ReadysEntry(): TableInfo_Waiter_ReadysEntry {
  return { key: 0, value: 0 };
}

export const TableInfo_Waiter_ReadysEntry = {
  encode(message: TableInfo_Waiter_ReadysEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int64(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).int64(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TableInfo_Waiter_ReadysEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableInfo_Waiter_ReadysEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseTableInfo_PlayersEntry(): TableInfo_PlayersEntry {
  return { key: 0, value: undefined };
}

export const TableInfo_PlayersEntry = {
  encode(message: TableInfo_PlayersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int64(message.key);
    }
    if (message.value !== undefined) {
      TableInfo_Player.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TableInfo_PlayersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableInfo_PlayersEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = TableInfo_Player.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

function createBaseTableInfo_LoseTeamsEntry(): TableInfo_LoseTeamsEntry {
  return { key: 0, value: 0 };
}

export const TableInfo_LoseTeamsEntry = {
  encode(message: TableInfo_LoseTeamsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int32(message.key);
    }
    if (message.value !== 0) {
      writer.uint32(16).int64(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TableInfo_LoseTeamsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableInfo_LoseTeamsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
};

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
