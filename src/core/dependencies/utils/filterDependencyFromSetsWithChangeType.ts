import { Either, right, left } from 'fp-ts/lib/Either';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';
import { filterDependenciesFromSets } from './filterDependenciesFromSets';

export const AddDependencyUpdateTypes = {
  MIGRATED_TO_SET: 'MIGRATED_TO_SET',
  UPDATED_WITHIN_SET: 'UPDATED_WITHIN_SET',
  ADDED_TO_SET: 'ADDED_TO_SET',
} as const;

export type AddDependencyChangeType = keyof typeof AddDependencyUpdateTypes;

export function filterDependencyFromSetsWithChangeType({
  setsContainingDependency,
  setToAddDependencyTo,
  dependencyName,
  groupConfig,
  migrateDependency,
  groupName,
}: {
  setsContainingDependency: string[];
  setToAddDependencyTo: string;
  dependencyName: string;
  groupConfig: GroupConfig;
  migrateDependency: boolean;
  groupName: string;
}): Either<VersionGuardError, [AddDependencyChangeType, GroupConfig]> {
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
