import logSymbols = require('log-symbols');
import humanizeDuration from 'humanize-duration';
import Table, { HorizontalTable, CrossTable } from 'cli-table3';

import { ArgvWithGlobalOptions } from './types';
import { VersionGuardError, VersionGuardErrorCode } from '../core/errors';

type CommandCreator = (yargs: ArgvWithGlobalOptions) => ArgvWithGlobalOptions;

export function pipeCommands(
  ...fns: CommandCreator[]
): (argv: ArgvWithGlobalOptions) => ArgvWithGlobalOptions {
  const [head, ...tail] = fns;
  return (argv: ArgvWithGlobalOptions) =>
    tail.reduce((acc, fn) => fn(acc), head(argv));
}

export function isVersionGuardErrorType(
  error: Error | VersionGuardError,
  code: VersionGuardErrorCode,
): boolean {
  return error instanceof VersionGuardError && error.errorCode === code;
}

interface Deferred<T> {
  resolve: () => void;
  reject: (reason?: Error | void) => void;
  promise: Promise<T>;
}
export function deferred<T = void>(): Deferred<T> {
  let resolve: () => void;
  let reject: (reason?: Error | void) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    resolve: () => resolve(),
    reject: reason => reject(reason),
    promise,
  };
}

function getTable(head: string[]): Table.Table {
  return new Table({
    wordWrap: true,
    head,
    style: {
      'padding-left': 0,
      'padding-right': 0,
      head: [],
      border: [],
      compact: true,
    },
  });
}

export function getHorizontalTableWithHeaders(head: string[]): HorizontalTable {
  return getTable(head) as HorizontalTable;
}

export function getCrossTableWithHeaders(head: string[]): CrossTable {
  return getTable(head) as CrossTable;
}

export function getLogSymbolForStatus(passed: boolean): string {
  return passed ? logSymbols.success : logSymbols.error;
}

export function formatDuration(duration: number): string {
  return humanizeDuration(duration, {
    units: ['d', 'h'],
    maxDecimalPoints: 2,
  });
}
