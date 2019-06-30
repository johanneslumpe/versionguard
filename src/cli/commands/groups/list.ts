import { map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { listGroups } from '../../core/groups';

export function listGroupsCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
    'groups:list',
    'show list of all registered groups',
    yargs => yargs,
    argv => {
      argv._asyncResult = pipe(
        listGroups(opts.logger)(argv.config.contents),
        map(groups => {
          return HandlerResult.create(
            LogMessage.info(
              groups.length
                ? `Groups found:\n${groups
                    .map(group => emphasize`${group}\n`)
                    .join('')
                    .trim()}`
                : 'No groups found',
            ),
            {
              type: 'GROUPS:LIST',
              result: {
                groups,
              },
            },
          );
        }),
      );
    },
  );
}
