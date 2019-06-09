import { ArgvWithGlobalOptions } from '../../types';
import { getGroupList } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { info } from '../../logger';

export function listGroupsCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:list',
    'show list of all registered groups',
    yargs => yargs,
    argv => {
      argv._asyncResult = (async () => {
        const existingGroups = getGroupList(argv.config.contents);
        if (!existingGroups.length) {
          info('No groups found');
        } else {
          info('Groups found:');
          existingGroups.forEach(group => info(emphasize`${group}`));
        }
      })();
    },
  );
}
