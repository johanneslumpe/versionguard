import { left, Either, right } from 'fp-ts/lib/Either';

import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

/**
 * Ensures that given set name does not exist within a group config
 */
export function ensureSetDoesNotExist(
  setName: string,
): (config: GroupConfig) => Either<VersionGuardError, GroupConfig> {
  return config => {
    return !config.dependencies[setName]
      ? right(config)
      : left(VersionGuardError.from(emphasize`Set ${setName} already exists`));
  };
}
