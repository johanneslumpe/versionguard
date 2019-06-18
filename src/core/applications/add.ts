import path from 'path';
import { TaskEither, fromEither } from 'fp-ts/lib/TaskEither';

import { getGroupConfig, normalizePaths } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { ensurePathsDoNotExist } from './utils/ensurePathsDoNotExist';
import { ensurePackageJsonsExist } from './utils/ensurePackageJsonsExist';

interface AddApplicationOptions {
  relativePaths: string[];
  groupName: string;
  configPath: string;
  config: VersionGuardConfig;
}

export function addApplications({
  relativePaths,
  configPath,
  groupName,
  config,
}: AddApplicationOptions): TaskEither<VersionGuardError, VersionGuardConfig> {
  return fromEither(getGroupConfig(groupName, config)).chain(groupConfig =>
    fromEither(
      ensurePathsDoNotExist({
        paths: normalizePaths({ configPath, relativePaths }),
        groupName,
      })(groupConfig),
    )
      .chain(ensurePackageJsonsExist(path.dirname(configPath)))
      .map(paths => ({
        ...config,
        [groupName]: {
          ...groupConfig,
          applications: groupConfig.applications.concat(paths),
        },
      })),
  );
}
