import { Argv, Arguments } from 'yargs';
import { configMiddleware } from './middleware/config';
import { HandlerResult } from './HandlerResult';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { VersionGuardError } from '../core/errors';

export type Unbox<T> = T extends Promise<infer R> ? R : T;
type CustomArgumentProperties = Unbox<ReturnType<typeof configMiddleware>> & {
  _asyncResult?: TaskEither<VersionGuardError, HandlerResult>;
};
export type ArgumentsWithConfig = Arguments<CustomArgumentProperties>;
export type ArgvWithGlobalOptions = Argv<
  CustomArgumentProperties & {
    verbose: boolean;
  } & { 'config-path'?: string }
>;
