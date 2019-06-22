import { chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { createDependencySetInGroup } from '../../core/dependencies';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

export function createDependencySetCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
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
      argv._asyncResult = pipe(
        createDependencySetInGroup({
          groupName: groupname,
          setName: setname,
          logger: opts.logger,
        })(config.contents),
        chain(writeConfig(argv.config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Dependency set ${setname} created within group ${groupname}`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
