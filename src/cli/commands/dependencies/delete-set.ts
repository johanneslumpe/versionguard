import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';
import { writeConfig } from '../../../core/config';
import { deleteDependencySetFromGroup } from '../../../core/dependencies';

export function deleteDependencySetCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
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
      argv._asyncResult = (async () => {
        const { config, groupname, setname } = argv;
        const updatedConfig = deleteDependencySetFromGroup({
          config: config.contents,
          groupName: groupname,
          setName: setname,
        });
        await writeConfig(config.path, updatedConfig);
        success(
          emphasize`Dependency set ${setname} deleted from group ${groupname}`,
        );
      })();
    },
  );
}
