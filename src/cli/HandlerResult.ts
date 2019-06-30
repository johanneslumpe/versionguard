import { LogMessage } from './LogMessage';
import { PublicHandlerResult } from './types';

/**
 * Data type to signify successful handler execution
 * which provides a message and additional data of the command execution
 */
export class HandlerResult {
  private _message: LogMessage;
  private _data: PublicHandlerResult;

  public constructor(message: LogMessage, data: PublicHandlerResult) {
    this._data = data;
    this._message = message;
  }

  public static create(
    message: LogMessage,
    data: PublicHandlerResult,
  ): HandlerResult {
    return new HandlerResult(message, data);
  }

  public get data(): object {
    return this._data;
  }

  public get message(): LogMessage {
    return this._message;
  }
}
