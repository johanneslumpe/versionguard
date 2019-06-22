import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { deleteDependencySetFromGroup } from '../../../core/dependencies';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

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
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(
            emphasize`Attempting to delete dependency set ${setname} from group ${groupname}...`,
          ),
        )(),
        chain(() =>
          fromEither(
            deleteDependencySetFromGroup({
              config: config.contents,
              groupName: groupname,
              setName: setname,
            }),
          ),
        ),
        chain(
          opts.logger.verboseLogTaskEither(LogMessage.info('Set deleted!')),
        ),
        chain(writeConfigWithLog(argv.config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Dependency set ${setname} deleted from group ${groupname}`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
