import { emphasize, getGroupConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

interface DeleteSetOptions {
  setName: string;
  groupName: string;
  config: VersionGuardConfig;
}

export function deleteDependencySetFromGroup({
  setName,
  groupName,
  config,
}: DeleteSetOptions): VersionGuardConfig {
  const groupConfig = getGroupConfig(groupName, config);
  if (!groupConfig.dependencies[setName]) {
    throw VersionGuardError.from(
      emphasize`Set ${setName} does not exist in group ${groupName}`,
    );
  }

  const clonedDependencies = { ...groupConfig.dependencies };
  delete clonedDependencies[setName];
  return {
    ...config,
    [groupName]: {
      ...groupConfig,
      dependencies: clonedDependencies,
    },
  };
}
