import { Argv, Arguments } from 'yargs';
import { configMiddleware } from './middleware/config';
import { Either } from 'fp-ts/lib/Either';
import { FailureResult, SuccessResult } from './commands/groups/add';

export type Unbox<T> = T extends Promise<infer R> ? R : T;
type CustomArgumentProperties = Unbox<ReturnType<typeof configMiddleware>> & {
  _asyncResult?:
    | Promise<unknown>
    | Either<Promise<FailureResult>, Promise<SuccessResult>>;
};
export type ArgumentsWithConfig = Arguments<CustomArgumentProperties>;
export type ArgvWithGlobalOptions = Argv<
  CustomArgumentProperties & {
    verbose: boolean;
  } & { 'config-path'?: string }
>;
