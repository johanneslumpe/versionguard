import { Either, chain, map } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { getGroupConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { ensureSetExists } from './utils/ensureSetExists';

interface DeleteSetOptions {
  /**
   * Name of set to delete
   */
  setName: string;

  /**
   * Group to delete set from
   */
  groupName: string;

  /**
   * Versionguard config to update
   */
  config: VersionGuardConfig;
}

export function deleteDependencySetFromGroup({
  setName,
  groupName,
  config,
}: DeleteSetOptions): Either<VersionGuardError, VersionGuardConfig> {
  return pipe(
    getGroupConfig(groupName, config),
    chain(ensureSetExists(setName)),
    map(groupConfig => {
      const clonedDependencies = { ...groupConfig.dependencies };
      delete clonedDependencies[setName];
      return {
        ...config,
        [groupName]: {
          ...groupConfig,
          dependencies: clonedDependencies,
        },
      };
    }),
  );
}
