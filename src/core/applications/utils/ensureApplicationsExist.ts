import { Either, left, right } from 'fp-ts/lib/Either';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

export function ensureApplicationsExist(
  paths: string[],
): (config: GroupConfig) => Either<VersionGuardError, string[]> {
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
