import { Argv, Arguments } from 'yargs';
import { configMiddleware } from './middleware/config';
import { HandlerResult } from './HandlerResult';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { VersionGuardError } from '../core/errors';

export type Unbox<T> = T extends Promise<infer R> ? R : T;
export type Config = Unbox<ReturnType<typeof configMiddleware>>;
type CustomArgumentProperties = Config & {
  _asyncResult?: TaskEither<VersionGuardError, HandlerResult>;
};
export type ArgumentsWithConfig = Arguments<CustomArgumentProperties>;
type GlobalOptions = {
  verbose?: boolean;
} & {
  json?: boolean;
} & { 'config-path'?: string };
export type ArgumentsWithConfigAndGlobalOptions = Arguments<
  CustomArgumentProperties & GlobalOptions
>;
export type ArgvWithGlobalOptions = Argv<
  CustomArgumentProperties & GlobalOptions
>;

/**
 * Public JSON API types
 *
 * The types represent the public api for `--json` output of the CLI. Any change other than adding new information
 * should be considered a breaking change.
 */

export interface AddApplicationCommandResult {
  type: 'ADD_APPLICATION';
  result: {
    group: string;
    application: {
      name: string;
      path: string;
    };
  };
}

export interface RemoveApplicationCommandResult {
  type: 'REMOVE_APPLICATION';
  result: {
    group: string;
    application: {
      name: string;
      path: string;
    };
  };
}

export interface GroupsListCommandResult {
  type: 'GROUPS_LIST';
  result: {
    groups: string[];
  };
}
