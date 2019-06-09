import { VersionGuardConfig } from '../config';
import { emphasize } from '../utils';
import { DependencySetConfig } from '../dependencies/create-set';
import { VersionGuardError } from '../errors';
import { Dictionary } from '../types';

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
): VersionGuardConfig {
  if (config[groupname]) {
    throw VersionGuardError.from(emphasize`Group ${groupname} already exists`);
  }

  return {
    ...config,
    [groupname]: createEmptyGroupConfig(),
  };
}
