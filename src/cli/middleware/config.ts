import { Arguments } from 'yargs';

import {
  findConfig,
  VersionGuardConfig,
  writeConfig,
  readConfig,
  getConfigPathForBase,
} from '../../core/config';
import { emphasize } from '../../core/utils';

interface ConfigData {
  config: {
    contents: VersionGuardConfig;
    path: string;
  };
}

export async function configMiddleware(
  yargs: Arguments<{ 'config-path'?: string }>,
): Promise<ConfigData> {
  let configPath = yargs['config-path'] || (await findConfig());
  let config: VersionGuardConfig;
  if (!configPath) {
    configPath = getConfigPathForBase('.');
    console.log(
      emphasize`No config file found, creating config at path: ${configPath}`,
    );
    config = {};
    await writeConfig(configPath)(config).run();
  } else {
    config = await readConfig(configPath);
  }
  return { config: { contents: config, path: configPath } };
}
