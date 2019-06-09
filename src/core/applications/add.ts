import path from 'path';
import fs from 'fs';

import { emphasize, getGroupConfig, isNodeJSError } from '../utils';
import { VersionGuardConfig } from '../config';
import { VersionGuardError } from '../errors';

interface AddApplicationOptions {
  relativePaths: string[];
  groupName: string;
  configPath: string;
  config: VersionGuardConfig;
}

function ensurePackageJsonsExist(
  basePath: string,
  relativePaths: string[],
): Promise<void[]> {
  return Promise.all(
    relativePaths.map(async relativePath => {
      const packageJsonPath = path.join(basePath, relativePath, 'package.json');
      try {
        await fs.promises.stat(packageJsonPath);
      } catch (e) {
        if (isNodeJSError(e) && e.code === 'ENOENT') {
          throw VersionGuardError.from(
            emphasize`Application in path ${path.join(
              basePath,
              relativePath,
            )} does not contain a valid package.json file`,
          );
        } else {
          throw e;
        }
      }
    }),
  );
}

export async function addApplications({
  relativePaths,
  configPath,
  groupName,
  config,
}: AddApplicationOptions): Promise<VersionGuardConfig> {
  const groupConfig = getGroupConfig(groupName, config);
  relativePaths.forEach(relativePath => {
    if (groupConfig.applications.includes(relativePath)) {
      throw VersionGuardError.from(
        emphasize`Group ${groupName} already includes application with path ${relativePath}`,
      );
    }
  });
  await ensurePackageJsonsExist(path.dirname(configPath), relativePaths);

  return {
    ...config,
    [groupName]: {
      ...groupConfig,
      applications: groupConfig.applications.concat(relativePaths),
    },
  };
}
