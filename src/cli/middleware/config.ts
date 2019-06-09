import { Arguments } from 'yargs';

import {
  findConfig,
  VersionGuardConfig,
  writeConfig,
  readConfig,
  getConfigPathForBase,
} from '../../core/config';
import { emphasize } from '../../core/utils';

const { log } = console;

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
    log(
      emphasize`No config file found, creating config at path: ${configPath}`,
    );
    config = {};
    await writeConfig(configPath, config);
  } else {
    config = await readConfig(configPath);
  }
  return { config: { contents: config, path: configPath } };
}
