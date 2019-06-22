import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { removeGroup } from '../../../core/groups';
import { writeConfig } from '../../../core/config';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

export function removeGroupCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
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
        fromEither(removeGroup(groupname, argv.config.contents)),
        chain(writeConfig(argv.config.path)),
        map(result =>
          HandlerResult.create(
            LogMessage.create(emphasize`Group ${groupname} removed!`),
            result,
          ),
        ),
      );
    },
  );
}
