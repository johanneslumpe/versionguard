import { Either, left, right } from 'fp-ts/lib/Either';

import { emphasize } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

export function renameGroup(
  oldname: string,
  newname: string,
  config: VersionGuardConfig,
): Either<VersionGuardError, VersionGuardConfig> {
  if (!config[oldname]) {
    return left(
      VersionGuardError.from(emphasize`Group ${oldname} does not exist`),
    );
  } else if (config[newname]) {
    return left(
      VersionGuardError.from(emphasize`Group ${newname} already exists`),
    );
  }
  const { [oldname]: existingConfig, ...rest } = config;
  return right({
    ...rest,
    [newname]: existingConfig,
  });
}
