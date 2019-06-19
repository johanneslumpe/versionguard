import path from 'path';
import { TaskEither, fromEither } from 'fp-ts/lib/TaskEither';

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
  return fromEither(getGroupConfig(groupName, config)).chain(groupConfig =>
    fromEither(
      ensurePathsDoNotExistForApplications({
        paths: normalizePaths({ configPath, relativePaths }),
        groupName,
      })(groupConfig),
    ).chain(paths =>
      readApplicationMetaDataForPaths(path.dirname(configPath))(paths).map(
        packageJsons => ({
          ...config,
          [groupName]: {
            ...groupConfig,
            applications: groupConfig.applications.concat(
              packageJsons
                .map(
                  (packageJson, index) => [paths[index], packageJson] as const,
                )
                .map(createApplication),
            ),
          },
        }),
      ),
    ),
  );
}
