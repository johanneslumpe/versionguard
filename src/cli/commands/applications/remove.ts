import pluralize from 'pluralize';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { writeConfig } from '../../../core/config';
import { removeApplication } from '../../../core/applications';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

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
            'Path(s) of application(s) to remove, relative to versionguard config file',
        })
        .string('groupname')
        .string('applicationpaths')
        .array('applicationpaths'),
    argv => {
      const { config, groupname, applicationpaths } = argv;
      argv._asyncResult = removeApplication({
        config: config.contents,
        configPath: config.path,
        groupName: groupname,
        relativePaths: applicationpaths,
      })
        .chain(writeConfig(config.path))
        .map(updatedConfig =>
          HandlerResult.create(
            LogMessage.create(
              emphasize`${pluralize(
                'Application',
                applicationpaths.length,
              )} in ${pluralize(
                'path',
                applicationpaths.length,
              )} ${applicationpaths.join(
                ', ',
              )} removed from group ${groupname}`,
            ),
            updatedConfig,
          ),
        );
    },
  );
}
