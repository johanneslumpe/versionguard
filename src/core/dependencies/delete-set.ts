import { Either } from 'fp-ts/lib/Either';

import { getGroupConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { ensureSetExists } from './utils/ensureSetExists';

interface DeleteSetOptions {
  setName: string;
  groupName: string;
  config: VersionGuardConfig;
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
