import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { removeGroup } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

export function removeGroupCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
    'groups:remove <groupname>',
    'remove group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'the group to remove',
        })
        .string('groupname'),
    argv => {
      const { groupname } = argv;
      argv._asyncResult = pipe(
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(
            emphasize`Attempting to remove group ${groupname}...`,
          ),
        )(),
        chain(() => fromEither(removeGroup(groupname, argv.config.contents))),
        chain(
          opts.logger.verboseLogTaskEither(LogMessage.info('Group removed!')),
        ),
        chain(writeConfigWithLog(argv.config.path, opts.logger)),
        map(result =>
          HandlerResult.create(
            LogMessage.success(emphasize`Group ${groupname} removed!`),
            result,
          ),
        ),
      );
    },
  );
}
