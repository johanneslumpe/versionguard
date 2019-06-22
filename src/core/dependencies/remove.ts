import { Either, either } from 'fp-ts/lib/Either';
import { Do } from 'fp-ts-contrib/lib/Do';

import { getGroupConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { filterDependenciesFromSets } from './utils/filterDependenciesFromSets';
import { ensureDependencyExistsInSet } from './utils/ensureDependencyExistsInSets';

interface RemoveDependencyOptions {
  /**
   * Group which contains the dependency set from which to remove a dependency
   */
  groupName: string;

  /**
   * Set from which to remove the `dependency`
   */
  setName: string;

  /**
   * Dependency to remove in the format of `dependency` or `dependency@version`.
   * In the latter case, the `version` part is ignored
   */
  dependency: string;

  /**
   * Versionguard config to update
   */
  config: VersionGuardConfig;
}

export function removeDependency({
  groupName,
  setName,
  dependency,
  config,
}: RemoveDependencyOptions): Either<VersionGuardError, VersionGuardConfig> {
  const [dependencyName] = dependency.split('@');
  return Do(either)
    .bind('groupConfig', getGroupConfig(groupName, config))
    .bindL('setsContainingDependency', ({ groupConfig }) =>
      ensureDependencyExistsInSet({
        setName,
        dependencyName,
        dependencySetConfig: groupConfig.dependencies[setName],
      }),
    )
    .return(({ groupConfig, setsContainingDependency }) => ({
      ...config,
      [groupName]: filterDependenciesFromSets({
        dependencyName,
        groupConfig,
        setsContainingDependency,
      }),
    }));
}
