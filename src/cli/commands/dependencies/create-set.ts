import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';
import { writeConfig } from '../../../core/config';
import { createDependencySetInGroup } from '../../../core/dependencies';

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
      argv._asyncResult = (async () => {
        const { config, groupname, setname } = argv;
        const updatedConfig = createDependencySetInGroup({
          config: config.contents,
          groupName: groupname,
          setName: setname,
        });
        await writeConfig(config.path, updatedConfig);
        success(
          emphasize`Dependency set ${setname} created within group ${groupname}`,
        );
      })();
    },
  );
}
