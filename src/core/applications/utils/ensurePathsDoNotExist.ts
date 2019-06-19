import { Either, left, right } from 'fp-ts/lib/Either';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

interface EnsurePathsDoNotExistOptions {
  paths: string[];
  groupName: string;
}

export function ensurePathsDoNotExist({
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
            emphasize`Group ${groupName} already includes application with paths ${existingPaths.join(
              ', ',
            )}`,
          ),
        )
      : right(paths);
  };
}
