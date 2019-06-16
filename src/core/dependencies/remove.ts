import { getGroupConfig, emphasize } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { filterDependenciesFromSets } from './utils/filterDependenciesFromSets';
import { findSetsContainingDependency } from './utils/findSetsContainingDependency';
import { Either, left, right } from 'fp-ts/lib/Either';
import { Dictionary, DependencySetConfig } from '../types';

interface RemoveDependencyOptions {
  groupName: string;
  setName: string;
  dependency: string;
  config: VersionGuardConfig;
}

function ensureDependencyExistsInSets({
  dependencyName,
  setName,
  dependencySetConfig,
}: {
  dependencyName: string;
  setName: string;
  dependencySetConfig: Dictionary<DependencySetConfig>;
}): Either<VersionGuardError, string[]> {
  const sets = findSetsContainingDependency(
    dependencyName,
    dependencySetConfig,
  );
  return sets.length
    ? right(sets)
    : left(
        VersionGuardError.from(
          emphasize`Dependency ${dependencyName} does not exist within set ${setName}`,
        ),
      );
}

export function removeDependency({
  groupName,
  setName,
  dependency,
  config,
}: RemoveDependencyOptions): Either<VersionGuardError, VersionGuardConfig> {
  const [dependencyName] = dependency.split('@');
  return getGroupConfig(groupName, config).chain(groupConfig =>
    ensureDependencyExistsInSets({
      setName,
      dependencyName,
      dependencySetConfig: groupConfig.dependencies,
    }).map(setsContainingDependency => ({
      ...config,
      [groupName]: filterDependenciesFromSets({
        dependencyName,
        groupConfig,
        setsContainingDependency,
      }),
    })),
  );
}
