import { emphasize, getGroupConfig, normalizePaths } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

interface RemoveApplicationOptions {
  relativePaths: string[];
  groupName: string;
  config: VersionGuardConfig;
  configPath: string;
}

export function removeApplication({
  relativePaths,
  config,
  configPath,
  groupName,
}: RemoveApplicationOptions): VersionGuardConfig {
  const groupConfig = getGroupConfig(groupName, config);
  const normalizedPaths = normalizePaths({ configPath, relativePaths });
  normalizedPaths.forEach(relativePath => {
    if (!groupConfig.applications.includes(relativePath)) {
      throw VersionGuardError.from(
        emphasize`Group does not include application with path ${relativePath}`,
      );
    }
  });

  return {
    ...config,
    [groupName]: {
      ...groupConfig,
      applications: groupConfig.applications.filter(
        path => !normalizedPaths.includes(path),
      ),
    },
  };
}
