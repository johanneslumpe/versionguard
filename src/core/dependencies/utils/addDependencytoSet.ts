import { Either } from 'fp-ts/lib/Either';

import { getDependencySetConfig } from '../../utils';
import { VersionGuardConfig } from '../../config';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

interface AppendDendencyOptions {
  config: VersionGuardConfig;
  groupName: string;
  groupConfig: GroupConfig;
  setName: string;
  dependency: string;
  version: string;
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
