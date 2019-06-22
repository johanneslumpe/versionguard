import path from 'path';
import { TaskEither, fromEither, taskEither } from 'fp-ts/lib/TaskEither';
import { Do } from 'fp-ts-contrib/lib/Do';

import { getGroupConfig, normalizePaths } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { ensurePathsDoNotExistForApplications } from './utils/ensurePathsDoNotExist';
import { readApplicationMetaDataForPaths } from './utils/ensurePackageJsonsExist';
import { PackageJson } from '../types';

interface AddApplicationOptions {
  /**
   *  Paths of the applications to add
   */
  relativePaths: string[];

  /**
   * Group to add application to
   */
  groupName: string;

  /**
   * Path of versionguard config file
   */
  configPath: string;

  /**
   * Versionguard config to update
   */
  config: VersionGuardConfig;
}

export interface Application {
  /**
   * Name of the application
   */
  name: string;

  /**
   * Path of the application, relative go the versionguard config file
   */
  path: string;
}

function createApplication([path, { name }]: readonly [
  string,
  PackageJson,
]): Application {
  return {
    name: name || path,
    path,
  };
}

export function addApplications({
  relativePaths,
  configPath,
  groupName,
  config,
}: AddApplicationOptions): TaskEither<VersionGuardError, VersionGuardConfig> {
  return Do(taskEither)
    .bind('groupConfig', fromEither(getGroupConfig(groupName, config)))
    .bindL('paths', context =>
      fromEither(
        ensurePathsDoNotExistForApplications({
          paths: normalizePaths({ configPath, relativePaths }),
          groupName,
        })(context.groupConfig),
      ),
    )
    .bindL('packageJsons', context =>
      readApplicationMetaDataForPaths(path.dirname(configPath))(context.paths),
    )
    .return(context => ({
      ...config,
      [groupName]: {
        ...context.groupConfig,
        applications: context.groupConfig.applications.concat(
          context.packageJsons
            .map(
              (packageJson, index) =>
                [context.paths[index], packageJson] as const,
            )
            .map(createApplication),
        ),
      },
    }));
}
