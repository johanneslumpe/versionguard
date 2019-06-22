import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { renameGroup } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

export function renameGroupCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
    'groups:rename <oldname> <newname>',
    'rename group',
    yargs =>
      yargs
        .positional('oldname', {
          describe: 'current name of group',
        })
        .positional('newname', {
          describe: 'new name of group',
        })
        .string('oldname')
        .string('newname'),
    argv => {
      const { oldname, newname } = argv;
      argv._asyncResult = pipe(
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(emphasize`Attempting to rename group...`),
        )(),
        chain(() =>
          fromEither(renameGroup(oldname, newname, argv.config.contents)),
        ),
        chain(
          opts.logger.verboseLogTaskEither(LogMessage.info('Group renamed!')),
        ),
        chain(writeConfigWithLog(argv.config.path, opts.logger)),
        map(config =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Group ${oldname} renamed to ${newname}!`,
            ),
            config,
          ),
        ),
      );
    },
  );
}
