import path from 'path';
import { TaskEither, fromEither } from 'fp-ts/lib/TaskEither';

import { getGroupConfig, normalizePaths } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { ensurePathsDoNotExist } from './utils/ensurePathsDoNotExist';
import { readApplicationMetaDataForPaths } from './utils/ensurePackageJsonsExist';
import { PackageJson } from '../types';

interface AddApplicationOptions {
  relativePaths: string[];
  groupName: string;
  configPath: string;
  config: VersionGuardConfig;
}

export interface Application {
  name: string;
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
      ensurePathsDoNotExist({
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
