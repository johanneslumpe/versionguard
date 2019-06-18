import { fromEither } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { getGroupList } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

export function listGroupsCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:list',
    'show list of all registered groups',
    yargs => yargs,
    argv => {
      argv._asyncResult = fromEither(
        getGroupList(argv.config.contents).map(groups => {
          return HandlerResult.create(
            LogMessage.create(
              groups.length
                ? `Groups found:\n${groups
                    .map(group => emphasize`${group}\n`)
                    .join('')
                    .trim()}`
                : 'No groups found',
              'info',
            ),
            groups,
          );
        }),
      );
    },
  );
}
