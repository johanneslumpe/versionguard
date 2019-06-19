import { Either, left, right } from 'fp-ts/lib/Either';
import pluralize from 'pluralize';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

interface EnsurePathsDoNotExistOptions {
  /**
   * Paths of applications to add, relative to versionguard config file
   */
  paths: string[];

  /**
   * Group to check for existing applications whose path matches a value in `paths`
   */
  groupName: string;
}

export function ensurePathsDoNotExistForApplications({
  paths,
  groupName,
}: EnsurePathsDoNotExistOptions): (
  config: GroupConfig,
) => Either<VersionGuardError, string[]> {
  return groupConfig => {
    const existingPaths = paths.filter(relativePath =>
      groupConfig.applications.find(({ path }) => path === relativePath),
    );
    return existingPaths.length
      ? left(
          VersionGuardError.from(
            emphasize`Group ${groupName} already includes ${pluralize(
              'application',
              existingPaths.length,
            )} with ${pluralize(
              'path',
              existingPaths.length,
            )} ${existingPaths.join(', ')}`,
          ),
        )
      : right(paths);
  };
}
