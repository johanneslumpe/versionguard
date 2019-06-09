import {
  emphasize,
  getGroupConfig,
  getDependencySetConfig,
  getMinSemverVersionOrThrow,
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
}: AppendDendencyOptions): VersionGuardConfig {
  const setConfig = getDependencySetConfig(setName, groupConfig);
  return {
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
  };
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

export function addDependency({
  groupName,
  setName,
  dependency,
  config,
  migrateDependency = false,
}: AddDependencyOptions): AddDependencyResult {
  let groupConfig = getGroupConfig(groupName, config);
  let changeType: AddDependencyChangeType =
    AddDependencyUpdateTypes.ADDED_TO_SET;
  const [dependencyName, version] = dependency.split('@');
  getMinSemverVersionOrThrow(version, dependencyName);
  const setsContainingDependency = findSetsContainingDependency(
    dependencyName,
    groupConfig.dependencies,
  );

  if (setsContainingDependency.includes(setName)) {
    groupConfig = filterDependenciesFromSets({
      dependencyName,
      setsContainingDependency,
      groupConfig,
    });
    changeType = AddDependencyUpdateTypes.UPDATED_WITHIN_SET;
  } else if (setsContainingDependency.length && !migrateDependency) {
    throw VersionGuardError.from(
      emphasize`Dependency ${dependencyName} cannot be part of multiple sets and already exists in dependency set ${setsContainingDependency[0]} for group ${groupName}`,
      VersionGuardError.codes.DEPENDENCY_EXISTS_IN_SIBLING_SET,
    );
  } else if (setsContainingDependency.length && migrateDependency) {
    groupConfig = filterDependenciesFromSets({
      dependencyName,
      setsContainingDependency,
      groupConfig,
    });
    changeType = AddDependencyUpdateTypes.MIGRATED_TO_SET;
  }

  return {
    updatedConfig: addDependencytoSet({
      config,
      groupName,
      groupConfig,
      setName,
      dependency: dependencyName,
      version,
    }),
    changeType,
  };
}
