import { chain, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { setGracePeriod } from '../../core/dependencies';
import { PipeCommandArgs } from '../../utils';
import { writeConfig } from '../../core/config';

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
        setGracePeriod({
          groupName: groupname,
          setName: setname,
          gracePeriod: graceperiod,
          logger: opts.logger,
        })(config.contents),
        chain(writeConfig(config.path, opts.logger)),
        map(updatedConfig =>
          HandlerResult.create(
            LogMessage.success(
              emphasize`Grace period for dependency set ${setname} updated`,
            ),
            {
              type: 'DEPENDENCY_SET:SET_GRACE_PERIOD',
              result: {
                group: groupname,
                dependencySet: setname,
                gracePeriod:
                  updatedConfig[groupname].dependencies[setname].gracePeriod,
              },
            },
          ),
        ),
      );
    },
  );
}
