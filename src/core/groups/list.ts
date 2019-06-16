import { VersionGuardConfig } from '../config';
import { Either, right, left } from 'fp-ts/lib/Either';
import { VersionGuardError } from '../errors';
import {} from 'fp-ts/lib/TaskEither';

export function getGroupList(
  config: VersionGuardConfig,
): Either<VersionGuardError, string[]> {
  try {
    const keys = Object.keys(config).sort();
    return right(keys);
  } catch (e) {
    return left(VersionGuardError.from('Could not read groups from config'));
  }
}
