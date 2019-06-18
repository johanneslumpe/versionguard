import { Either } from 'fp-ts/lib/Either';

import { getGroupConfig, getMinSemverVersion } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { findSetsContainingDependency } from './utils/findSetsContainingDependency';
import {
  filterDependencyFromSetsWithChangeType,
  AddDependencyChangeType,
} from './utils/filterDependencyFromSetsWithChangeType';
import { addDependencytoSet } from './utils/addDependencytoSet';

interface AddDependencyOptions {
  groupName: string;
  setName: string;
  dependency: string;
  config: VersionGuardConfig;
  migrateDependency?: boolean;
}

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
}: AddDependencyOptions): Either<VersionGuardError, AddDependencyResult> {
  const [dependencyName, version] = dependency.split('@');
  return (
    getGroupConfig(groupName, config)
      // TODO this should probably be a `Validation` instead of the hacky `chain`
      .chain(groupConfig =>
        getMinSemverVersion(version, dependencyName).map(() => groupConfig),
      )
      .chain(groupConfig =>
        filterDependencyFromSetsWithChangeType({
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
