import { Either, left, right } from 'fp-ts/lib/Either';

import { VersionGuardConfig } from '../config';
import { emphasize } from '../utils';
import { VersionGuardError } from '../errors';
import { Dictionary, DependencySetConfig } from '../types';

export function createEmptyGroupConfig(): GroupConfig {
  return {
    applications: [],
    dependencies: {},
  };
}

export interface GroupConfig {
  applications: string[];
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
