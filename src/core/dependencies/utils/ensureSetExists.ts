import { Either, left, right } from 'fp-ts/lib/Either';
import { emphasize } from '../../utils';
import { VersionGuardError } from '../../errors';
import { GroupConfig } from '../../groups';

/**
 * Ensures that given set name exists within a group config
 */
export function ensureSetExists(
  setName: string,
): (config: GroupConfig) => Either<VersionGuardError, GroupConfig> {
  return config => {
    return !config.dependencies[setName]
      ? left(VersionGuardError.from(emphasize`Set ${setName} does not exist`))
      : right(config);
  };
}
