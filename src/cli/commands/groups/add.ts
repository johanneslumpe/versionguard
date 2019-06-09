import { ArgvWithGlobalOptions } from '../../types';
import { addGroup } from '../../../core/groups';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';
import { writeConfig } from '../../../core/config';

export function addGroupCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:add <groupname>',
    'add group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'name of group to add',
        })
        .string('groupname'),
    argv => {
      argv._asyncResult = (async () => {
        const config = addGroup(argv.groupname, argv.config.contents);
        await writeConfig(argv.config.path, config);
        success(emphasize`Group ${argv.groupname} added!`);
      })();
    },
  );
}
