import { chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { deleteDependencySetFromGroup } from '../../core/dependencies';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

export function deleteDependencySetCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
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
        deleteDependencySetFromGroup({
          groupName: groupname,
          setName: setname,
          logger: opts.logger,
        })(config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
        map(() =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Dependency set ${setname} deleted from group ${groupname}`,
            ),
            {
              type: 'DEPENDENCY_SET:DELETE',
              result: {
                group: groupname,
                dependencySet: setname,
              },
            },
          ),
        ),
      );
    },
  );
}
