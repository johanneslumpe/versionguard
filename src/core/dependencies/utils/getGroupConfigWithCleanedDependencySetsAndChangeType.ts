import { Either, right, left } from 'fp-ts/lib/Either';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';
import {
  filterDependenciesFromSets,
  FilterSetsOptions,
} from './filterDependenciesFromSets';

export const AddDependencyUpdateTypes = {
  MIGRATED_TO_SET: 'MIGRATED_TO_SET',
  UPDATED_WITHIN_SET: 'UPDATED_WITHIN_SET',
  ADDED_TO_SET: 'ADDED_TO_SET',
} as const;

export type AddDependencyChangeType = keyof typeof AddDependencyUpdateTypes;

interface GetGroupConfigWithCleanedDependencySetsAndChangeTypeOptions
  extends FilterSetsOptions {
  /**
   * Set that dependendency will be added to
   */
  setToAddDependencyTo: string;

  /**
   * Whether dependency should be migrated
   */
  migrateDependency: boolean;

  /**
   * Name of group to add dependency to
   */
  groupName: string;
}

/**
 * Determines which update type is required to add a dependency to a given set within a group
 * and returns a tuple of the required change type and a prepared group config. The config which will
 * have all dependency sets cleaned of the dependency about to be added, if required.
 */
export function getGroupConfigWithCleanedDependencySetsAndChangeType({
  setsContainingDependency,
  setToAddDependencyTo,
  dependencyName,
  groupConfig,
  migrateDependency,
  groupName,
}: GetGroupConfigWithCleanedDependencySetsAndChangeTypeOptions): Either<
  VersionGuardError,
  [AddDependencyChangeType, GroupConfig]
> {
  if (setsContainingDependency.includes(setToAddDependencyTo)) {
    return right([
      AddDependencyUpdateTypes.UPDATED_WITHIN_SET,
      filterDependenciesFromSets({
        dependencyName,
        setsContainingDependency,
        groupConfig,
      }),
    ]);
  } else if (setsContainingDependency.length && migrateDependency) {
    return right([
      AddDependencyUpdateTypes.MIGRATED_TO_SET,
      filterDependenciesFromSets({
        dependencyName,
        setsContainingDependency,
        groupConfig,
      }),
    ]);
  } else if (setsContainingDependency.length && !migrateDependency) {
    return left(
      VersionGuardError.from(
        emphasize`Dependency ${dependencyName} cannot be part of multiple sets and already exists in dependency set ${setsContainingDependency[0]} for group ${groupName}`,
        VersionGuardError.codes.DEPENDENCY_EXISTS_IN_SIBLING_SET,
      ),
    );
  } else {
    return right([AddDependencyUpdateTypes.ADDED_TO_SET, groupConfig]);
  }
}
