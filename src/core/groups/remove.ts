import { Either, left, right } from 'fp-ts/lib/Either';

import { emphasize } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

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
