import { Either, either } from 'fp-ts/lib/Either';
import { Do } from 'fp-ts-contrib/lib/Do';

import { getGroupConfig, getMinSemverVersion } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { findSetsContainingDependency } from './utils/findSetsContainingDependency';
import {
  getGroupConfigWithCleanedDependencySetsAndChangeType,
  AddDependencyChangeType,
} from './utils/getGroupConfigWithCleanedDependencySetsAndChangeType';
import { addDependencytoSet } from './utils/addDependencytoSet';

interface AddDependencyOptions {
  /**
   * Group to add dependency to
   */
  groupName: string;

  /**
   * Set to add dependency to
   */
  setName: string;

  /**
   * Dependency to add in the format of `dependency@version`
   */
  dependency: string;

  /**
   * Versionguard config to update
   */
  config: VersionGuardConfig;

  /**
   * Whether the dependency should be migrated to `setName` if found within another set
   */
  migrateDependency?: boolean;
}

export interface AddDependencyResult {
  /**
   * Updated versionguard config
   */
  updatedConfig: VersionGuardConfig;

  /**
   * Describes how the dependency was added to the set
   */
  changeType: AddDependencyChangeType;
}

export function addDependency({
  groupName,
  setName,
  dependency,
  config,
  migrateDependency = false,
}: AddDependencyOptions): Either<VersionGuardError, AddDependencyResult> {
  const [dependencyName, version] = dependency.split('@');
  return Do(either)
    .bind('groupConfig', getGroupConfig(groupName, config))
    .doL(() => getMinSemverVersion(version, dependencyName))
    .bindL('changeTypeAndCleanedConfig', ({ groupConfig }) =>
      getGroupConfigWithCleanedDependencySetsAndChangeType({
        setsContainingDependency: findSetsContainingDependency(
          dependencyName,
          groupConfig.dependencies,
        ),
        groupConfig,
        groupName,
        dependencyName,
        migrateDependency,
        setToAddDependencyTo: setName,
      }),
    )
    .bindL('updatedConfig', ({ changeTypeAndCleanedConfig }) =>
      addDependencytoSet({
        config,
        groupName,
        groupConfig: changeTypeAndCleanedConfig[1],
        setName,
        dependency: dependencyName,
        version,
      }),
    )
    .return(({ updatedConfig, changeTypeAndCleanedConfig }) => ({
      updatedConfig,
      changeType: changeTypeAndCleanedConfig[0],
    }));
}
