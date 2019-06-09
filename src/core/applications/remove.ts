import { emphasize, getGroupConfig } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

interface RemoveApplicationOptions {
  relativePaths: string[];
  groupName: string;
  config: VersionGuardConfig;
}

export function removeApplication({
  relativePaths,
  config,
  groupName,
}: RemoveApplicationOptions): VersionGuardConfig {
  const groupConfig = getGroupConfig(groupName, config);
  relativePaths.forEach(relativePath => {
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
        path => !relativePaths.includes(path),
      ),
    },
  };
}
