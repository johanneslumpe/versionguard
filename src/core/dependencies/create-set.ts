import { emphasize, getGroupConfig } from '../utils';
import { Dictionary } from '../types';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

export interface DependencyConfig {
  dateAdded: number;
  semver: string;
}

export interface DependencySetConfig {
  dependencySemvers: Dictionary<DependencyConfig>;
  gracePeriod: number;
}

export function createEmptyDependencySetConfig(): DependencySetConfig {
  return {
    dependencySemvers: {},
    gracePeriod: Infinity,
  };
}

interface CreateDependencySetInGroupOptions {
  setName: string;
  groupName: string;
  config: VersionGuardConfig;
}

export function createDependencySetInGroup({
  setName,
  groupName,
  config,
}: CreateDependencySetInGroupOptions): VersionGuardConfig {
  const groupConfig = getGroupConfig(groupName, config);
  if (groupConfig.dependencies[setName]) {
    throw VersionGuardError.from(
      emphasize`Set ${setName} already exists in group ${groupName}`,
    );
  }

  return {
    ...config,
    [groupName]: {
      ...groupConfig,
      dependencies: {
        ...groupConfig.dependencies,
        [setName]: createEmptyDependencySetConfig(),
      },
    },
  };
}
