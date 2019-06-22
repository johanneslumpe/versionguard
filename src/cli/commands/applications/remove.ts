import pluralize from 'pluralize';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain, map } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { removeApplication } from '../../../core/applications';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

export function removeApplicationCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
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
      const applicationStr = pluralize('Application', applicationpaths.length);
      const pathStr = pluralize('path', applicationpaths.length);
      const applicationPaths = applicationpaths.join(', ');

      argv._asyncResult = pipe(
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(
            emphasize`Attempting to remove ${applicationStr} in ${pathStr} ${applicationPaths}...`,
          ),
        )(),
        chain(() =>
          removeApplication({
            config: config.contents,
            configPath: config.path,
            groupName: groupname,
            relativePaths: applicationpaths,
          }),
        ),
        chain(
          opts.logger.verboseLogTaskEither(
            LogMessage.info('Application removed!'),
          ),
        ),
        chain(writeConfigWithLog(argv.config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`${applicationStr} in ${pathStr} ${applicationPaths} removed from group ${groupname}`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
