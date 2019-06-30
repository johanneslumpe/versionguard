import { chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { addGroup } from '../../core/groups';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

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
        addGroup(argv.groupname, opts.logger)(argv.config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
        map(() =>
          HandlerResult.create(
            LogMessage.success(emphasize`Group ${argv.groupname} added!`),
            {
              type: 'GROUPS:ADD',
              result: {
                group: argv.groupname,
              },
            },
          ),
        ),
      );
    },
  );
}
