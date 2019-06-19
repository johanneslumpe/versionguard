import { Either, left, right } from 'fp-ts/lib/Either';

import { VersionGuardConfig } from '../config';
import { emphasize } from '../utils';
import { VersionGuardError } from '../errors';
import { Dictionary, DependencySetConfig } from '../types';
import { Application } from '../applications';

export function createEmptyGroupConfig(): GroupConfig {
  return {
    applications: [],
    dependencies: {},
  };
}

export interface GroupConfig {
  /**
   * Applications registered with this group
   */
  applications: Application[];

  /**
   * Dependency sets registered with this group
   */
  dependencies: Dictionary<DependencySetConfig>;
}

export function addGroup(
  groupname: string,
  config: VersionGuardConfig,
): Either<VersionGuardError, VersionGuardConfig> {
  if (config[groupname]) {
    return left(
      VersionGuardError.from(emphasize`Group ${groupname} already exists`),
    );
  }

  return right({
    ...config,
    [groupname]: createEmptyGroupConfig(),
  });
}
