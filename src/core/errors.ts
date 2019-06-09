import { ObjectValues } from './types';

const codes = {
  DEPENDENCY_EXISTS_IN_SIBLING_SET: 2000,
} as const;

export type VersionGuardErrorCode = ObjectValues<typeof codes>;

export class VersionGuardError extends Error {
  public constructor(msg: string, errorCode?: VersionGuardErrorCode) {
    super(msg);
    this.errorCode = errorCode;
  }

  public static readonly codes = codes;

  public readonly errorCode?: VersionGuardErrorCode;

  public static from(
    msg: string,
    errorCode?: VersionGuardErrorCode,
  ): VersionGuardError {
    return new VersionGuardError(msg, errorCode);
  }
}
