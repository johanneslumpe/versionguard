import pluralize from 'pluralize';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';
import { writeConfig } from '../../../core/config';
import { removeApplication } from '../../../core/applications';

export function removeApplicationCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'applications:remove <groupname> <applicationpaths..>',
    'remove application from group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'Group to remove application from',
        })
        .positional('applicationpaths', {
          describe:
            'Path of application to remove, relative to version-guard config file',
        })
        .string('groupname')
        .string('applicationpaths')
        .array('applicationpaths'),
    argv => {
      argv._asyncResult = (async () => {
        const { config, groupname, applicationpaths } = argv;
        const updatedConfig = await removeApplication({
          config: config.contents,
          configPath: config.path,
          groupName: groupname,
          relativePaths: applicationpaths,
        });
        await writeConfig(config.path, updatedConfig);
        success(
          emphasize`${pluralize(
            'Application',
            applicationpaths.length,
          )} in ${pluralize(
            'path',
            applicationpaths.length,
          )} ${applicationpaths.join(', ')} removed from group ${groupname}`,
        );
      })();
    },
  );
}
