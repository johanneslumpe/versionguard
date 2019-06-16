import { Either, right, left } from 'fp-ts/lib/Either';

import {
  emphasize,
  getGroupConfig,
  getDependencySetConfig,
  getMinSemverVersion,
} from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { GroupConfig } from '../groups';
import { findSetsContainingDependency } from './utils/findSetsContainingDependency';
import { filterDependenciesFromSets } from './utils/filterDependenciesFromSets';

interface AddDependencyOptions {
  groupName: string;
  setName: string;
  dependency: string;
  config: VersionGuardConfig;
  migrateDependency?: boolean;
}

interface AppendDendencyOptions {
  config: VersionGuardConfig;
  groupName: string;
  groupConfig: GroupConfig;
  setName: string;
  dependency: string;
  version: string;
  dateAdded?: number;
}

function addDependencytoSet({
  config,
  groupName,
  groupConfig,
  setName,
  dependency,
  version,
  dateAdded = Date.now(),
}: AppendDendencyOptions): Either<VersionGuardError, VersionGuardConfig> {
  return getDependencySetConfig(setName, groupConfig).map(setConfig => ({
    ...config,
    [groupName]: {
      ...groupConfig,
      dependencies: {
        ...groupConfig.dependencies,
        [setName]: {
          ...setConfig,
          dependencySemvers: {
            ...setConfig.dependencySemvers,
            [dependency]: {
              semver: `${dependency}@${version}`,
              dateAdded,
            },
          },
        },
      },
    },
  }));
}

export const AddDependencyUpdateTypes = {
  MIGRATED_TO_SET: 'MIGRATED_TO_SET',
  UPDATED_WITHIN_SET: 'UPDATED_WITHIN_SET',
  ADDED_TO_SET: 'ADDED_TO_SET',
} as const;

export type AddDependencyChangeType = keyof typeof AddDependencyUpdateTypes;
export interface AddDependencyResult {
  updatedConfig: VersionGuardConfig;
  changeType: AddDependencyChangeType;
}

function removeDependencyFromSet({
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
        removeDependencyFromSet({
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
