import { VersionGuardConfig } from '../config';
import { emphasize } from '../utils';
import { VersionGuardError } from '../errors';
import { Either, left, right } from 'fp-ts/lib/Either';

export function removeGroup(
  oldname: string,
  config: VersionGuardConfig,
): Either<VersionGuardError, VersionGuardConfig> {
  if (!config[oldname]) {
    return left(
      VersionGuardError.from(emphasize`Group ${oldname} does not exist`),
    );
  }
  const clone = { ...config };
  delete clone[oldname];
  return right(clone);
}
