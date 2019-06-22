import { TaskEither, fromEither, taskEither } from 'fp-ts/lib/TaskEither';
import { Do } from 'fp-ts-contrib/lib/Do';

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
  return Do(taskEither)
    .bind('groupConfig', fromEither(getGroupConfig(groupName, config)))
    .bindL('paths', context =>
      fromEither(
        ensureApplicationsExist(normalizePaths({ configPath, relativePaths }))(
          context.groupConfig,
        ),
      ),
    )
    .return(context => ({
      ...config,
      [groupName]: {
        ...context.groupConfig,
        applications: context.groupConfig.applications.filter(
          application => !context.paths.includes(application.path),
        ),
      },
    }));
}
