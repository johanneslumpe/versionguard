import { Either, left, right } from 'fp-ts/lib/Either';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { findSetsContainingDependency } from './findSetsContainingDependency';
import { DependencySetConfig } from '../../types';

interface EnsureDependencyExistsInSetsOptions {
  /**
   * Name of dependency to search for
   */
  dependencyName: string;
  /**
   * Name of set to search in
   */
  setName: string;

  /**
   * Dependency set config to search
   */
  dependencySetConfig: DependencySetConfig;
}

/**
 * Checks for existence of a dependency within a single dependency set
 */
export function ensureDependencyExistsInSet({
  dependencyName,
  setName,
  dependencySetConfig,
}: EnsureDependencyExistsInSetsOptions): Either<VersionGuardError, string[]> {
  const sets = findSetsContainingDependency(dependencyName, {
    [setName]: dependencySetConfig,
  });
  return sets.length
    ? right(sets)
    : left(
        VersionGuardError.from(
          emphasize`Dependency ${dependencyName} does not exist within set ${setName}`,
        ),
      );
}
