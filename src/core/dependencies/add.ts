import { Either } from 'fp-ts/lib/Either';

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
  return (
    getGroupConfig(groupName, config)
      // TODO this should probably be a `Validation` instead of the hacky `chain`
      .chain(groupConfig =>
        getMinSemverVersion(version, dependencyName).map(() => groupConfig),
      )
      .chain(groupConfig =>
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
        }).chain(([changeType, groupConfig]) =>
          addDependencytoSet({
            config,
            groupName,
            groupConfig,
            setName,
            dependency: dependencyName,
            version,
          }).map(updatedConfig => ({
            updatedConfig,
            changeType,
          })),
        ),
      )
  );
}
