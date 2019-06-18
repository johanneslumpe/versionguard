import { Either } from 'fp-ts/lib/Either';

import { getGroupConfig } from '../utils';
import { DependencySetConfig } from '../types';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { ensureSetDoesNotExist } from './utils/ensureSetDoesNotExist';

function createEmptyDependencySetConfig(): DependencySetConfig {
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
