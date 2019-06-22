import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { createDependencySetInGroup } from '../../../core/dependencies';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

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
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(
            emphasize`Attempting to create dependency set ${setname}...`,
          ),
        )(),
        chain(() =>
          fromEither(
            createDependencySetInGroup({
              config: config.contents,
              groupName: groupname,
              setName: setname,
            }),
          ),
        ),
        chain(
          opts.logger.verboseLogTaskEither(LogMessage.info('Set created!')),
        ),
        chain(writeConfigWithLog(argv.config.path, opts.logger)),
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
