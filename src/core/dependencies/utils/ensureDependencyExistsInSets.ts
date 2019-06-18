import { Either, left, right } from 'fp-ts/lib/Either';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { findSetsContainingDependency } from './findSetsContainingDependency';
import { Dictionary, DependencySetConfig } from '../../types';

interface EnsureDependencyExistsInSetsOptions {
  dependencyName: string;
  setName: string;
  dependencySetConfig: Dictionary<DependencySetConfig>;
}

export function ensureDependencyExistsInSets({
  dependencyName,
  setName,
  dependencySetConfig,
}: EnsureDependencyExistsInSetsOptions): Either<VersionGuardError, string[]> {
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
