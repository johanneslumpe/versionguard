import { fromEither, chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { setGracePeriod } from '../../../core/dependencies/setGracePeriod';
import { PipeCommandArgs, writeConfigWithLog } from '../../utils';
import { VersionGuardError } from '../../../core/errors';

export function setGracePeriodCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
    'dependencies:grace-period <groupname> <setname> <graceperiod>',
    'set grace period of dependency set within group. accepts numeric values in milliseconds, a day value like `30d`, or `Infinity`',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'group dependency set belongs to',
        })
        .positional('setname', {
          describe: 'name of dependency set to update',
        })
        .positional('graceperiod', {
          describe: 'name of dependency set to update',
        })
        .example('dependencies:grace-period', 'my-group my-set 30d')
        .string('groupname')
        .string('setname')
        .string('graceperiod'),
    argv => {
      const { config, groupname, setname, graceperiod } = argv;
      argv._asyncResult = pipe(
        opts.logger.verboseLogTaskEither<VersionGuardError, void>(
          LogMessage.info(
            emphasize`Attempting to set grace period for set ${setname} within group ${groupname}...`,
          ),
        )(),
        chain(() =>
          fromEither(
            setGracePeriod({
              config: config.contents,
              groupName: groupname,
              setName: setname,
              gracePeriod: graceperiod,
            }),
          ),
        ),
        chain(
          opts.logger.verboseLogTaskEither(
            LogMessage.info('Grace period updated!'),
          ),
        ),
        chain(writeConfigWithLog(config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Grace period for dependency set ${setname} updated`,
            ),
            updatedConfig,
          ),
        ),
      );
    },
  );
}
