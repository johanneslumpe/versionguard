import { IO } from 'fp-ts/lib/IO';
import { TaskEither, fromIO } from 'fp-ts/lib/TaskEither';

import { LogMessage } from './LogMessage';

export class Logger {
  private _verbose: boolean;

  /**
   * Creates a new logger instance
   * @param verbose If verbose mode is enabled
   */
  public static create(verbose?: boolean): Logger {
    return new Logger(verbose);
  }

  public constructor(verbose = false) {
    this._verbose = verbose;
  }

  /**
   * Setter to enable verbose logging
   */
  public set verbose(verbose: boolean) {
    this._verbose = verbose;
  }

  /**
   * Creates a logging `IO`. This is different from the `Console` implementation
   * provided by `fp-ts` in that it allows conditional logging based on the logger
   * instance's `verbose` property.
   * @param f Function returning a `LogMessage`
   */
  private getLogIO<A>(
    f: (a: A) => LogMessage,
    value: A,
    forceLog = false,
  ): IO<A> {
    return new IO(() => {
      if (forceLog || this._verbose) {
        console.log(f(value).formattedMessage);
      }
      return value;
    });
  }

  /**
   * Creates a wrapper around `IO` that will lazily execute `f` and log the resulting
   * `LogMessage` to the console
   * @param f Function returning a `LogMessage`
   */
  public logL<A>(f: (a: A) => LogMessage): (a: A) => IO<A> {
    return (a: A) => {
      return this.getLogIO<A>(f, a, true);
    };
  }

  /**
   * Creates a wrapper around `IO` that will lazily execute `f` if verbose
   * logging is enabled when it itself is executed
   * @param f Function returning a `LogMessage`
   */
  public verboseLogL<A>(f: (a: A) => LogMessage): (a: A) => IO<A> {
    return (a: A) => {
      return this.getLogIO<A>(f, a);
    };
  }

  /**
   * Creates a `TaskEither` that will lazily execute `f` if verbose
   * logging is enabled when this task is executed
   * @param f Function returning a `LogMessage`
   */
  public verboseLogTaskEitherL<L = never, A = void>(
    f: (a: A) => LogMessage,
  ): (a: A) => TaskEither<L, A> {
    return a => fromIO(this.verboseLogL(f)(a));
  }
}
