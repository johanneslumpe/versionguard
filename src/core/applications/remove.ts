import { TaskEither, fromEither } from 'fp-ts/lib/TaskEither';

import { getGroupConfig, normalizePaths } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { ensureApplicationsExist } from './utils/ensureApplicationsExist';

interface RemoveApplicationOptions {
  /**
   * Paths to remove, must match paths of applications in config file
   */
  relativePaths: string[];

  /**
   * Group to remove applications from
   */
  groupName: string;

  /**
   * Versionguard config to update
   */
  config: VersionGuardConfig;

  /**
   * Path of config file
   */
  configPath: string;
}

export function removeApplication({
  relativePaths,
  config,
  configPath,
  groupName,
}: RemoveApplicationOptions): TaskEither<
  VersionGuardError,
  VersionGuardConfig
> {
  return fromEither(getGroupConfig(groupName, config)).chain(groupConfig =>
    fromEither(
      ensureApplicationsExist(normalizePaths({ configPath, relativePaths }))(
        groupConfig,
      ),
    ).map(paths => ({
      ...config,
      [groupName]: {
        ...groupConfig,
        applications: groupConfig.applications.filter(
          application => !paths.includes(application.path),
        ),
      },
    })),
  );
}
