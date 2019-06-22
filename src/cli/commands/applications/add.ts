import pluralize from 'pluralize';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain, map } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { addApplications } from '../../../core/applications';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

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
      const applicationStr = pluralize('Application', applicationpaths.length);
      const applicationPaths = applicationpaths.join(', ');
      const pathStr = pluralize('path', applicationpaths.length);
      argv._asyncResult = pipe(
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(
            emphasize`Attempting to add ${applicationStr} in ${pathStr} ${applicationPaths}...`,
          ),
        )(),
        chain(() =>
          addApplications({
            config: config.contents,
            groupName: groupname,
            configPath: argv.config.path,
            relativePaths: applicationpaths,
          }),
        ),
        chain(
          opts.logger.verboseLogTaskEither(
            LogMessage.info('Application added!'),
          ),
        ),
        chain(writeConfigWithLog(argv.config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
              `${applicationStr} in ${pathStr} ${emphasize`${applicationPaths}`} added to group ${groupname}`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
