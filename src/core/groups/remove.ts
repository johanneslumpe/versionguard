import { VersionGuardConfig } from '../config';
import { emphasize } from '../utils';
import { VersionGuardError } from '../errors';

export function removeGroup(
  oldname: string,
  config: VersionGuardConfig,
): VersionGuardConfig {
  if (!config[oldname]) {
    throw VersionGuardError.from(emphasize`Group ${oldname} does not exist`);
  }
  const clone = { ...config };
  delete clone[oldname];
  return clone;
}
