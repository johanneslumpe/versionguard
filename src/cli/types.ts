import { Argv, Arguments } from 'yargs';
import { configMiddleware } from './middleware/config';

export type Unbox<T> = T extends Promise<infer R> ? R : T;
type CustomArgumentProperties = Unbox<ReturnType<typeof configMiddleware>> & {
  _asyncResult?: Promise<unknown>;
};
export type ArgumentsWithConfig = Arguments<CustomArgumentProperties>;
export type ArgvWithGlobalOptions = Argv<
  CustomArgumentProperties & {
    verbose: boolean;
  } & { 'config-path'?: string }
>;
