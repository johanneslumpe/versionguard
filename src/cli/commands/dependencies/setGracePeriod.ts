import { fromEither } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { writeConfig } from '../../../core/config';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { setGracePeriod } from '../../../core/dependencies/setGracePeriod';

export function setGracePeriodCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
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
      argv._asyncResult = fromEither(
        setGracePeriod({
          config: config.contents,
          groupName: groupname,
          setName: setname,
          gracePeriod: graceperiod,
        }),
      )
        .chain(writeConfig(config.path))
        .map(updatedConfig =>
          HandlerResult.create(
            LogMessage.create(
              emphasize`Grace period for dependency set ${setname} updated`,
            ),
            updatedConfig,
          ),
        );
    },
  );
}
