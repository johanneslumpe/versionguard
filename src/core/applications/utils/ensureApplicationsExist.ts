import { Either, left, right } from 'fp-ts/lib/Either';
import pluralize from 'pluralize';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

export function ensureApplicationsExist(
  paths: string[],
): (config: GroupConfig) => Either<VersionGuardError, string[]> {
  return groupConfig => {
    const nonExistingPaths = paths.filter(
      relativePath =>
        !groupConfig.applications.find(({ path }) => path === relativePath),
    );
    return nonExistingPaths.length
      ? left(
          VersionGuardError.from(
            emphasize`Group does not include ${pluralize(
              'application',
              nonExistingPaths.length,
            )} with ${pluralize(
              'path',
              nonExistingPaths.length,
            )} ${nonExistingPaths.join(', ')}`,
          ),
        )
      : right(paths);
  };
}
