import { emphasize, getGroupConfig, normalizePaths } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';
import { TaskEither, fromEither } from 'fp-ts/lib/TaskEither';
import { GroupConfig } from '../groups';
import { Either, left, right } from 'fp-ts/lib/Either';

interface RemoveApplicationOptions {
  relativePaths: string[];
  groupName: string;
  config: VersionGuardConfig;
  configPath: string;
}

function ensureApplicationsExist({
  paths,
}: {
  paths: string[];
}): (config: GroupConfig) => Either<VersionGuardError, string[]> {
  return groupConfig => {
    const nonExistingPaths = paths.filter(
      relativePath => !groupConfig.applications.includes(relativePath),
    );
    return nonExistingPaths.length
      ? left(
          VersionGuardError.from(
            emphasize`Group does not include application with path ${nonExistingPaths.join(
              ', ',
            )}}`,
          ),
        )
      : right(paths);
  };
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
  const normalizedPaths = normalizePaths({ configPath, relativePaths });
  return fromEither(getGroupConfig(groupName, config)).chain(groupConfig =>
    fromEither(
      ensureApplicationsExist({ paths: normalizedPaths })(groupConfig),
    ).map(paths => ({
      ...config,
      [groupName]: {
        ...groupConfig,
        applications: groupConfig.applications.filter(
          path => !paths.includes(path),
        ),
      },
    })),
  );
}
