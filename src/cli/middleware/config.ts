import { Arguments } from 'yargs';

import {
  findConfig,
  VersionGuardConfig,
  writeConfig,
  readConfig,
  getConfigPathForBase,
} from '../../core/config';
import { emphasize } from '../../core/utils';
import { GlobalOptions } from '../types';

interface ConfigData {
  config: {
    /**
     * Parsed config
     */
    contents: VersionGuardConfig;

    /**
     * Path used to retrieve config
     */
    path: string;
  };
}

export async function configMiddleware(
  yargs: Arguments<GlobalOptions>,
): Promise<ConfigData> {
  let configPath = yargs['config-path'] || (await findConfig());
  let config: VersionGuardConfig;
  if (!configPath) {
    configPath = getConfigPathForBase('.');
    if (!!yargs.verbose) {
      console.log(
        emphasize`No config file found, creating config at path: ${configPath}`,
      );
    }
    config = {};
    await writeConfig(configPath)(config).run();
  } else {
    config = await readConfig(configPath);
  }
  return { config: { contents: config, path: configPath } };
}
