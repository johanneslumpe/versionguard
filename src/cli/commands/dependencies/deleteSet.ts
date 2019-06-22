import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { writeConfig } from '../../../core/config';
import { deleteDependencySetFromGroup } from '../../../core/dependencies';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

export function deleteDependencySetCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'dependencies:delete-set <groupname> <setname>',
    'delete dependency set from group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'group to delete dependency set from',
        })
        .positional('setname', {
          describe: 'name of dependency set to delete',
        })
        .string('groupname')
        .string('setname'),
    argv => {
      const { config, groupname, setname } = argv;
      argv._asyncResult = pipe(
        fromEither(
          deleteDependencySetFromGroup({
            config: config.contents,
            groupName: groupname,
            setName: setname,
          }),
        ),
        chain(writeConfig(config.path)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.create(
              emphasize`Dependency set ${setname} deleted from group ${groupname}`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
