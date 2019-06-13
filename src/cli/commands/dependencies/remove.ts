import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';
import { writeConfig } from '../../../core/config';
import { removeDependency } from '../../../core/dependencies/remove';

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
      argv._asyncResult = (async () => {
        const { config, groupname, setname, dependency } = argv;
        const updatedConfig = removeDependency({
          config: config.contents,
          dependency,
          groupName: groupname,
          setName: setname,
        });
        await writeConfig(config.path)(updatedConfig).run();
        success(
          emphasize`Dependency ${dependency} successfully removed from set ${setname} within group ${groupname}`,
        );
      })();
    },
  );
}
