import { Argv, Arguments } from 'yargs';
import { configMiddleware } from './middleware/config';
import { HandlerResult } from './HandlerResult';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { VersionGuardError } from '../core/errors';
import { Dictionary } from '../core/types';

export type Unbox<T> = T extends Promise<infer R> ? R : T;
export type Config = Unbox<ReturnType<typeof configMiddleware>>;
type CustomArgumentProperties = Config & {
  _asyncResult?: TaskEither<VersionGuardError, HandlerResult>;
};
export type ArgumentsWithConfig = Arguments<CustomArgumentProperties>;
export type GlobalOptions = {
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

export interface PublicApplication {
  name: string;
  path: string;
}

export interface PublicDependency {
  addedAt: number;
  semanticVersion: string;
}

export interface PublicDependencySet {
  name: string;
  dependencies: Dictionary<PublicDependency>;
  gracePeriod: number;
}

export interface DependencySetCreateCommandResult {
  type: 'DEPENDENCY_SET:CREATE';
  result: {
    group: string;
    dependencySet: PublicDependencySet;
  };
}

export interface DependencySetDeleteCommandResult {
  type: 'DEPENDENCY_SET:DELETE';
  result: {
    group: string;
    dependencySet: string;
  };
}

export interface DependencyAddToSetCommandResult {
  type: 'DEPENDENCY:ADD_TO_SET';
  result: {
    group: string;
    dependencySet: string;
    dependency: PublicDependency;
  };
}

export interface DependencyRemoveFromSetCommandResult {
  type: 'DEPENDENCY:REMOVE_FROM_SET';
  result: {
    group: string;
    dependencySet: string;
    dependency: string;
  };
}

export interface DependencySetGracePeriodCommandResult {
  type: 'DEPENDENCY_SET:SET_GRACE_PERIOD';
  result: {
    group: string;
    dependencySet: string;
    gracePeriod: number;
  };
}

export interface ApplicationsAddCommandResult {
  type: 'APPLICATIONS:ADD';
  result: {
    group: string;
    applications: PublicApplication[];
  };
}

export interface ApplicationsRemoveCommandResult {
  type: 'APPLICATIONS:REMOVE';
  result: {
    group: string;
    applications: string[];
  };
}

export interface GroupsListCommandResult {
  type: 'GROUPS:LIST';
  result: {
    groups: string[];
  };
}

export interface GroupsInfoCommandResult {
  type: 'GROUPS:INFO';
  result: {
    group: {
      name: string;
      applications: PublicApplication[];
      dependencySets: Dictionary<PublicDependencySet>;
    };
  };
}

export interface GroupsRenameCommandResult {
  type: 'GROUPS:RENAME';
  result: {
    from: string;
    to: string;
  };
}

export interface GroupsAddCommandResult {
  type: 'GROUPS:ADD';
  result: {
    group: string;
  };
}

export interface GroupsRemoveCommandResult {
  type: 'GROUPS:REMOVE';
  result: {
    group: string;
  };
}

type PublicDependenyCheckStatus = 'PASS' | 'FAIL' | 'TENTATIVE_PASS';

interface PublicDependencyCheckResult {
  dependency: string;
  currentVersion: string;
  requiredVersion: string;
  status: PublicDependenyCheckStatus;
  timeLeftForUpgrade: number;
}

export interface PublicApplicationResult {
  status: PublicDependenyCheckStatus;
  dependencies: PublicDependencyCheckResult[];
}
export interface PublicGroupResult {
  status: PublicDependenyCheckStatus;
  applications: Dictionary<PublicApplicationResult>;
}

export interface PublicCheckResult {
  status: PublicDependenyCheckStatus;
  groups: Dictionary<PublicGroupResult>;
}
export interface VersionCheckCommandResult {
  type: 'VERSIONCHECK';
  result: PublicCheckResult;
}

export type PublicHandlerResult =
  | DependencySetCreateCommandResult
  | DependencySetDeleteCommandResult
  | DependencyAddToSetCommandResult
  | DependencyRemoveFromSetCommandResult
  | DependencySetGracePeriodCommandResult
  | ApplicationsAddCommandResult
  | ApplicationsRemoveCommandResult
  | GroupsListCommandResult
  | GroupsInfoCommandResult
  | GroupsRenameCommandResult
  | GroupsAddCommandResult
  | GroupsRemoveCommandResult
  | VersionCheckCommandResult;
