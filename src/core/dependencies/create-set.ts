import { left, Either, right } from 'fp-ts/lib/Either';

import { emphasize, getGroupConfig } from '../utils';
import { DependencySetConfig } from '../types';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { GroupConfig } from '../groups';

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

function ensureSetDoesNotExist(
  setName: string,
): (config: GroupConfig) => Either<VersionGuardError, GroupConfig> {
  return config => {
    return !config.dependencies[setName]
      ? right(config)
      : left(VersionGuardError.from(emphasize`Set ${setName} already exists`));
  };
}

export function createDependencySetInGroup({
  setName,
  groupName,
  config,
}: CreateDependencySetInGroupOptions): Either<
  VersionGuardError,
  VersionGuardConfig
> {
  return getGroupConfig(groupName, config)
    .chain(ensureSetDoesNotExist(setName))
    .map(groupConfig => ({
      ...config,
      [groupName]: {
        ...groupConfig,
        dependencies: {
          ...groupConfig.dependencies,
          [setName]: createEmptyDependencySetConfig(),
        },
      },
    }));
}
