import { VersionGuardConfig } from '../config';
import { emphasize } from '../utils';
import { VersionGuardError } from '../errors';

export function renameGroup(
  oldname: string,
  newname: string,
  config: VersionGuardConfig,
): VersionGuardConfig {
  if (!config[oldname]) {
    throw VersionGuardError.from(emphasize`Group ${oldname} does not exist`);
  } else if (config[newname]) {
    throw VersionGuardError.from(emphasize`Group ${newname} already exists`);
  }
  const { [oldname]: existingConfig, ...rest } = config;
  return {
    ...rest,
    [newname]: existingConfig,
  };
}
