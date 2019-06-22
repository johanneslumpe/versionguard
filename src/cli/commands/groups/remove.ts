import { chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { removeGroup } from '../../core/groups';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

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
        removeGroup(groupname, opts.logger)(argv.config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
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
