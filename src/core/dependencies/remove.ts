import { getGroupConfig, emphasize } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { filterDependenciesFromSets } from './utils/filterDependenciesFromSets';
import { findSetsContainingDependency } from './utils/findSetsContainingDependency';

interface RemoveDependencyOptions {
  groupName: string;
  setName: string;
  dependency: string;
  config: VersionGuardConfig;
}

export function removeDependency({
  groupName,
  setName,
  dependency,
  config,
}: RemoveDependencyOptions): VersionGuardConfig {
  const [dependencyName] = dependency.split('@');
  const groupConfig = getGroupConfig(groupName, config);
  const setsContainingDependency = findSetsContainingDependency(
    dependencyName,
    groupConfig.dependencies,
  );

  if (!setsContainingDependency.length) {
    throw VersionGuardError.from(
      emphasize`Dependency ${dependencyName} does not exist within set ${setName}`,
    );
  }

  return {
    ...config,
    [groupName]: filterDependenciesFromSets({
      dependencyName,
      groupConfig: getGroupConfig(groupName, config),
      setsContainingDependency: setsContainingDependency,
    }),
  };
}
