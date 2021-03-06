import { chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { removeDependency } from '../../core/dependencies';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

export function removeDependencyCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
    'dependencies:remove <groupname> <setname> <dependency>',
    'remove dependency from set within group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'group containing dependency set',
        })
        .positional('setname', {
          describe: 'name of set to remove dependency from',
        })
        .positional('dependency', {
          describe: 'dependency to remove',
        })
        .string('groupname')
        .string('setname')
        .string('dependency'),
    argv => {
      const { config, groupname, setname, dependency } = argv;
      argv._asyncResult = pipe(
        removeDependency({
          dependency,
          groupName: groupname,
          setName: setname,
          logger: opts.logger,
        })(config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
        map(() =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Dependency ${dependency} successfully removed from set ${setname} within group ${groupname}`,
            ),
            {
              type: 'DEPENDENCY:REMOVE_FROM_SET',
              result: {
                group: groupname,
                dependencySet: setname,
                dependency,
              },
            },
          ),
        ),
      );
    },
  );
}
