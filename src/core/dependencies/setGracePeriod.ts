import { Either } from 'fp-ts/lib/Either';

import { getGroupConfig, getDependencySetConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { DependencySetConfig } from '../types';
import { GroupConfig } from '../groups';
import { getGracePeriodValue } from './utils/getGracePeriodValue';

interface SetGracePeriodOptions {
  /**
   * Group containing set to modify
   */
  groupName: string;

  /**
   * Set to update
   */
  setName: string;

  /**
   * New grace period value
   */
  gracePeriod: number | string;

  /**
   * Versionguard config to update
   */
  config: VersionGuardConfig;
}

function updateGracePeriod(
  gracePeriod: number,
): (setConfig: DependencySetConfig) => DependencySetConfig {
  return setConfig => ({
    ...setConfig,
    gracePeriod,
  });
}

function mergeUpdatedSetConfig({
  config,
  groupConfig,
  groupName,
  setName,
}: {
  config: VersionGuardConfig;
  groupConfig: GroupConfig;
  groupName: string;
  setName: string;
}): (setConfig: DependencySetConfig) => VersionGuardConfig {
  return setConfig => ({
    ...config,
    [groupName]: {
      ...groupConfig,
      dependencies: {
        ...groupConfig.dependencies,
        [setName]: setConfig,
      },
    },
  });
}

export function setGracePeriod({
  groupName,
  setName,
  config,
  gracePeriod,
}: SetGracePeriodOptions): Either<VersionGuardError, VersionGuardConfig> {
  return getGracePeriodValue(gracePeriod).chain(parsedGracePeriod =>
    getGroupConfig(groupName, config).chain(groupConfig =>
      getDependencySetConfig(setName, groupConfig)
        .map(updateGracePeriod(parsedGracePeriod))
        .map(
          mergeUpdatedSetConfig({ groupConfig, setName, groupName, config }),
        ),
    ),
  );
}
