import { Either, left, right } from 'fp-ts/lib/Either';

import { emphasize, getGroupConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { GroupConfig } from '../groups';

interface DeleteSetOptions {
  setName: string;
  groupName: string;
  config: VersionGuardConfig;
}

function ensureSetExists(
  setName: string,
): (config: GroupConfig) => Either<VersionGuardError, GroupConfig> {
  return config => {
    return !config.dependencies[setName]
      ? left(VersionGuardError.from(emphasize`Set ${setName} does not exist`))
      : right(config);
  };
}

export function deleteDependencySetFromGroup({
  setName,
  groupName,
  config,
}: DeleteSetOptions): Either<VersionGuardError, VersionGuardConfig> {
  return getGroupConfig(groupName, config)
    .chain(ensureSetExists(setName))
    .map(groupConfig => {
      const clonedDependencies = { ...groupConfig.dependencies };
      delete clonedDependencies[setName];
      return {
        ...config,
        [groupName]: {
          ...groupConfig,
          dependencies: clonedDependencies,
        },
      };
    });
}
