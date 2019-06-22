import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { renameGroup } from '../../../core/groups';
import { writeConfig } from '../../../core/config';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

export function renameGroupCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
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
        fromEither(renameGroup(oldname, newname, argv.config.contents)),
        chain(writeConfig(argv.config.path)),
        map(config =>
          HandlerResult.create(
            LogMessage.create(
              emphasize`Group ${oldname} renamed to ${newname}!`,
            ),
            config,
          ),
        ),
      );
    },
  );
}
