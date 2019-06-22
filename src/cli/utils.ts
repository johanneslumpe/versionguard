import logSymbols = require('log-symbols');
import humanizeDuration from 'humanize-duration';
import Table, { HorizontalTable, CrossTable } from 'cli-table3';
import { pipe } from 'fp-ts/lib/pipeable';
import { TaskEither, chain } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from './types';
import { VersionGuardError, VersionGuardErrorCode } from '../core/errors';
import { Logger } from './Logger';
import { writeConfig, VersionGuardConfig } from '../core';
import { LogMessage } from './LogMessage';
export interface PipeCommandArgs {
  cli: ArgvWithGlobalOptions;
  logger: Logger;
}

type CommandCreator = (opts: PipeCommandArgs) => ArgvWithGlobalOptions;

export function pipeCommands(
  ...fns: CommandCreator[]
): (options: PipeCommandArgs) => ArgvWithGlobalOptions {
  const [head, ...tail] = fns;
  return (opts: PipeCommandArgs) =>
    tail.reduce((acc, fn) => fn({ ...opts, cli: acc }), head(opts));
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

export function writeConfigWithLog(
  path: string,
  logger: Logger,
): (
  data: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return data =>
    pipe(
      logger.verboseLogTaskEitherL<VersionGuardError, VersionGuardConfig>(() =>
        LogMessage.info('Writing config...'),
      )(data),
      chain(() => writeConfig(path)(data)),
      chain(
        logger.verboseLogTaskEitherL(() => LogMessage.info('Config written!')),
      ),
    );
}
