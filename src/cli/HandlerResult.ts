import { LogMessage } from './LogMessage';

export class HandlerResult {
  private _message: LogMessage;
  private _data: object;
  public constructor(message: LogMessage, data: object) {
    this._data = data;
    this._message = message;
  }
  public static create(message: LogMessage, data: object): HandlerResult {
    return new HandlerResult(message, data);
  }
  public get data(): object {
    return this._data;
  }
  public get message(): string {
    return this._message.formattedMessage;
  }
}