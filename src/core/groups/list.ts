import { Either, right, left } from 'fp-ts/lib/Either';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

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
