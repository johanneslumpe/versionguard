import { fromEither } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { writeConfig } from '../../../core/config';
import { createDependencySetInGroup } from '../../../core/dependencies';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

export function createDependencySetCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'dependencies:create-set <groupname> <setname>',
    'create dependency set within group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'group to add dependency set to',
        })
        .positional('setname', {
          describe: 'name of dependency set to add',
        })
        .string('groupname')
        .string('setname'),
    argv => {
      const { config, groupname, setname } = argv;
      argv._asyncResult = fromEither(
        createDependencySetInGroup({
          config: config.contents,
          groupName: groupname,
          setName: setname,
        }),
      )
        .chain(writeConfig(config.path))
        .map(updatedConfig =>
          HandlerResult.create(
            LogMessage.create(
              emphasize`Dependency set ${setname} created within group ${groupname}`,
            ),
            updatedConfig,
          ),
        );
    },
  );
}
