import logSymbols from 'log-symbols';

import { ObjectValues } from '../core/types';
import { getLogSymbolForStatus } from './utils';

function success(msg: string): string {
  return `${getLogSymbolForStatus(true)} ${msg}`;
}

function error(msg: string): string {
  return `${getLogSymbolForStatus(false)} ${msg}`;
}

function warning(msg: string): string {
  return `${logSymbols.warning} ${msg}`;
}

export function info(msg: string): string {
  return `${logSymbols.info} ${msg}`;
}

export const messageTypes = {
  info: 'info',
  success: 'success',
  error: 'error',
} as const;

type MessageType = ObjectValues<typeof messageTypes>;

export class LogMessage {
  private _message: string;
  private _type: MessageType;
  public constructor(message: string, type: MessageType) {
    this._message = message;
    this._type = type;
  }
  public static create(
    message: string,
    type: MessageType = 'success',
  ): LogMessage {
    return new LogMessage(message, type);
  }
  public get message(): string {
    return this._message;
  }
  public get formattedMessage(): string {
    switch (this._type) {
      case 'success':
        return success(this._message);
      case 'info':
        return info(this._message);
      case 'error':
        return error(this._message);
    }
  }
}
