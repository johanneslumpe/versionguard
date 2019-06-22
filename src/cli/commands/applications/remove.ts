import pluralize from 'pluralize';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain, map } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { removeApplications } from '../../core/applications';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

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

      argv._asyncResult = pipe(
        removeApplications({
          configPath: config.path,
          groupName: groupname,
          relativePaths: applicationpaths,
          logger: opts.logger,
        })(config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
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
        ),
      );
    },
  );
}
