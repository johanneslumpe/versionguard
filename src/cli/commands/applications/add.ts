import pluralize from 'pluralize';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain, map } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { addApplications } from '../../core/applications';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

export function addApplicationCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
    'applications:add <groupname> <applicationpaths..>',
    'add application to group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'Group to add an application to',
        })
        .positional('applicationpaths', {
          describe: 'Path(s) of application(s) to add, relative to config file',
        })
        .example('applications:add', 'my-group app-a app-b app-c')
        .string('groupname')
        .array('applicationpaths')
        .string('applicationpaths'),
    argv => {
      const { config, groupname, applicationpaths } = argv;
      argv._asyncResult = pipe(
        addApplications({
          groupName: groupname,
          configPath: argv.config.path,
          relativePaths: applicationpaths,
          logger: opts.logger,
        })(config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
              `${pluralize(
                'Application',
                applicationpaths.length,
              )} in ${pluralize(
                'path',
                applicationpaths.length,
              )} ${emphasize`${applicationpaths.join(
                ', ',
              )}`} added to group ${groupname}`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
