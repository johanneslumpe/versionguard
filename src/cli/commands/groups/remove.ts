import { ArgvWithGlobalOptions } from '../../types';
import { removeGroup } from '../../../core/groups';
import { writeConfig } from '../../../core/config';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';

export function removeGroupCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:remove <groupname>',
    'remove group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'the group to remove',
        })
        .string('groupname'),
    argv => {
      argv._asyncResult = (async () => {
        const { groupname } = argv;
        const config = removeGroup(groupname, argv.config.contents);
        await writeConfig(argv.config.path, config);
        success(emphasize`Group ${groupname} removed!`);
      })();
    },
  );
}
