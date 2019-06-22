import { IO } from 'fp-ts/lib/IO';
import { TaskEither, fromIO } from 'fp-ts/lib/TaskEither';

import { LogMessage } from './LogMessage';

export class Logger {
  private _verbose: boolean;

  public static create(verbose?: boolean): Logger {
    return new Logger(verbose);
  }

  public constructor(verbose = false) {
    this._verbose = verbose;
  }

  public set verbose(verbose: boolean) {
    this._verbose = verbose;
  }

  private getLogIO<A>(f: (a: A) => LogMessage, value: A): IO<A> {
    return new IO(() => {
      if (this._verbose) {
        console.log(f(value).formattedMessage);
      }
      return value;
    });
  }

  public verboseLogL<A>(f: (a: A) => LogMessage): (a: A) => IO<A> {
    return (a: A) => {
      return this.getLogIO<A>(f, a);
    };
  }

  public verboseLogTaskEitherL<L, A>(
    f: (a: A) => LogMessage,
  ): (a: A) => TaskEither<L, A> {
    return a => fromIO(this.verboseLogL(f)(a));
  }

  public verboseLogTaskEither<L, A>(f: LogMessage): (a: A) => TaskEither<L, A> {
    return a => fromIO(this.getLogIO(() => f, a));
  }
}
