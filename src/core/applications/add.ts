import path from 'path';
import fs from 'fs';

import {
  emphasize,
  getGroupConfig,
  isNodeJSError,
  normalizePaths,
} from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { TaskEither, fromEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { GroupConfig } from '../groups';
import {
  Either,
  left as eitherLeft,
  right as eitherRight,
} from 'fp-ts/lib/Either';

interface AddApplicationOptions {
  relativePaths: string[];
  groupName: string;
  configPath: string;
  config: VersionGuardConfig;
}

function ensurePackageJsonsExist(
  basePath: string,
): (relativePaths: string[]) => TaskEither<VersionGuardError, string[]> {
  return relativePaths =>
    tryCatch(
      () =>
        Promise.all(
          relativePaths.map(async relativePath => {
            const packageJsonPath = path.join(
              basePath,
              relativePath,
              'package.json',
            );
            try {
              await fs.promises.stat(packageJsonPath);
            } catch (e) {
              if (isNodeJSError(e) && e.code === 'ENOENT') {
                throw VersionGuardError.from(
                  emphasize`Application in path ${path.join(
                    basePath,
                    relativePath,
                  )} does not contain a valid package.json file`,
                );
              } else {
                throw e;
              }
            }
          }),
        ).then(() => relativePaths),
      err => VersionGuardError.from(String(err)),
    );
}

function ensurePathsDoNotExist({
  paths,
  groupName,
}: {
  paths: string[];
  groupName: string;
}): (config: GroupConfig) => Either<VersionGuardError, string[]> {
  return groupConfig => {
    const existingPaths = paths.filter(relativePath =>
      groupConfig.applications.includes(relativePath),
    );
    return existingPaths.length
      ? eitherLeft(
          VersionGuardError.from(
            emphasize`Group ${groupName} already includes application with paths ${existingPaths.join(
              ', ',
            )}`,
          ),
        )
      : eitherRight(paths);
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
