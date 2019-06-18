import { Either } from 'fp-ts/lib/Either';

import { getGroupConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { filterDependenciesFromSets } from './utils/filterDependenciesFromSets';
import { ensureDependencyExistsInSets } from './utils/ensureDependencyExistsInSets';

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
