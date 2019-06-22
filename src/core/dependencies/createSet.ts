import { Either, chain, map } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

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
  /**
   * Name of set to create
   */
  setName: string;

  /**
   * Group to create set in
   */
  groupName: string;

  /**
   * Versionguard config to update
   */
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
  return pipe(
    getGroupConfig(groupName, config),
    chain(ensureSetDoesNotExist(setName)),
    map(groupConfig => ({
      ...config,
      [groupName]: {
        ...groupConfig,
        dependencies: {
          ...groupConfig.dependencies,
          [setName]: createEmptyDependencySetConfig(),
        },
      },
    })),
  );
}
