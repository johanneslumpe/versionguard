import { Either, map } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { getDependencySetConfig } from '../../utils';
import { VersionGuardConfig } from '../../config';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

interface AppendDendencyOptions {
  /**
   * Versionguard config to update
   */
  config: VersionGuardConfig;

  /**
   * Group which contains set to add dependency to
   */
  groupName: string;

  /**
   * Group config to update
   */
  groupConfig: GroupConfig;

  /**
   * Set to add dependency to
   */
  setName: string;

  /**
   * Dependency
   */
  dependency: string;

  /**
   * Version of dependency
   */
  version: string;

  /**
   * Date when dependency was added, defaults to `Date.now()`
   */
  dateAdded?: number;
}
export function addDependencytoSet({
  config,
  groupName,
  groupConfig,
  setName,
  dependency,
  version,
  dateAdded = Date.now(),
}: AppendDendencyOptions): Either<VersionGuardError, VersionGuardConfig> {
  return pipe(
    getDependencySetConfig(setName, groupConfig),
    map(setConfig => ({
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
    })),
  );
}
