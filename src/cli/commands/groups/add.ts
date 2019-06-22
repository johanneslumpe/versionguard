import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { addGroup } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

export function addGroupCommand(opts: PipeCommandArgs): ArgvWithGlobalOptions {
  return opts.cli.command(
    'groups:add <groupname>',
    'add group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'name of group to add',
        })
        .string('groupname'),
    argv => {
      argv._asyncResult = pipe(
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(
            emphasize`Attempting to add group ${argv.groupname}...`,
          ),
        )(),
        chain(() => fromEither(addGroup(argv.groupname, argv.config.contents))),
        chain(
          opts.logger.verboseLogTaskEither(LogMessage.info('Group added!')),
        ),
        chain(writeConfigWithLog(argv.config.path, opts.logger)),
        map(data =>
          HandlerResult.create(
            LogMessage.success(emphasize`Group ${argv.groupname} added!`),
            data,
          ),
        ),
      );
    },
  );
}
