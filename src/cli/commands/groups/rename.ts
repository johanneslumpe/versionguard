import { chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { renameGroup } from '../../core/groups';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

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
        renameGroup(oldname, newname, opts.logger)(argv.config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
        map(() =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Group ${oldname} renamed to ${newname}!`,
            ),
            {
              type: 'GROUPS:RENAME',
              result: {
                from: oldname,
                to: newname,
              },
            },
          ),
        ),
      );
    },
  );
}
