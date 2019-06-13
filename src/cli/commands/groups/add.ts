import { ArgvWithGlobalOptions } from '../../types';
import { addGroup } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { writeConfig } from '../../../core/config';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Either } from 'fp-ts/lib/Either';
import { VersionGuardError } from '../../../core/errors';

export type SuccessResult = Result<'success'>;
export type FailureResult = Result<'failure'>;

class Result<T> {
  private _isError: boolean;
  private _data: string;
  public constructor(data: string, isError: boolean) {
    this._data = data;
    this._isError = isError;
  }

  public get isError(): boolean {
    return this._isError;
  }

  public static success(data: string): SuccessResult {
    return new Result(data, false);
  }

  public static failure(err: Error): FailureResult {
    return new Result(err.message, true);
  }

  public get data(): string {
    return this._data;
  }
}

function mapTaskToMessage(
  msg: string,
): (
  x: TaskEither<NodeJS.ErrnoException, void>,
) => Promise<Either<NodeJS.ErrnoException, string>> {
  return (x: TaskEither<NodeJS.ErrnoException, void>) =>
    x.run().then(te => te.map(() => msg));
}

function wrapErrorInResultPromise(
  e: VersionGuardError,
): Promise<FailureResult> {
  return Promise.resolve(Result.failure(e));
}

export function addGroupCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:add <groupname>',
    'add group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'name of group to add',
        })
        .string('groupname'),
    argv => {
      argv._asyncResult = addGroup(argv.groupname, argv.config.contents)
        .map(writeConfig(argv.config.path))
        .map((x: TaskEither<NodeJS.ErrnoException, void>) =>
          x.run().then(te => te.map(() => 'success')),
        )
        .bimap(
          err => Promise.resolve(Result.failure(e)),
          r => r.then(te => te.fold(Result.failure, Result.success)),
        );
    },
  );
}
