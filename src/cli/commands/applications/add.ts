import pluralize from 'pluralize';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';
import { writeConfig } from '../../../core/config';
import { addApplications } from '../../../core/applications';

export function addApplicationCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'applications:add <groupname> <applicationpaths..>',
    'add application to group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'Group to add an application to',
        })
        .positional('applicationpaths', {
          describe: 'Paths of applications to add, relative to config file',
        })
        .example('applications:add', 'my-group app-a app-b app-c')
        .string('groupname')
        .array('applicationpaths')
        .string('applicationpaths'),
    argv => {
      argv._asyncResult = (async () => {
        const { config, groupname, applicationpaths } = argv;
        const updatedConfig = await addApplications({
          config: config.contents,
          groupName: groupname,
          configPath: argv.config.path,
          relativePaths: applicationpaths,
        });
        await writeConfig(config.path, updatedConfig);
        success(
          `${pluralize('Application', applicationpaths.length)} in ${pluralize(
            'path',
            applicationpaths.length,
          )} ${emphasize`${applicationpaths.join(
            ', ',
          )}`} added to group ${groupname}`,
        );
      })();
    },
  );
}
