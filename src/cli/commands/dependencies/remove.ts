import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { writeConfig } from '../../../core/config';
import { removeDependency } from '../../../core/dependencies/remove';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

export function removeDependencyCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
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
        fromEither(
          removeDependency({
            config: config.contents,
            dependency,
            groupName: groupname,
            setName: setname,
          }),
        ),
        chain(writeConfig(config.path)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.create(
              emphasize`Dependency ${dependency} successfully removed from set ${setname} within group ${groupname}`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
