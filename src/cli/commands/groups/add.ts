import { fromEither } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { addGroup } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { writeConfig } from '../../../core/config';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

export function addGroupCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:add <groupname>',
    'add group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'name of group to add',
        })
        .string('groupname'),
    argv => {
      argv._asyncResult = fromEither(
        addGroup(argv.groupname, argv.config.contents),
      )
        .chain(writeConfig(argv.config.path))
        .map(data =>
          HandlerResult.create(
            LogMessage.create(emphasize`Group ${argv.groupname} added!`),
            data,
          ),
        );
    },
  );
}
