import { ArgvWithGlobalOptions } from '../../types';
import { renameGroup } from '../../../core/groups';
import { writeConfig } from '../../../core/config';
import { emphasize } from '../../../core/utils';
import { success } from '../../logger';

export function renameGroupCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:rename <oldname> <newname>',
    'rename group',
    yargs =>
      yargs
        .positional('oldname', {
          describe: 'current name of group',
        })
        .positional('newname', {
          describe: 'new name of group',
        })
        .string('oldname')
        .string('newname'),
    argv => {
      argv._asyncResult = (async () => {
        const { oldname, newname } = argv;
        const config = renameGroup(oldname, newname, argv.config.contents);
        await writeConfig(argv.config.path)(config).run();
        success(emphasize`Group ${oldname} renamed to ${newname}!`);
      })();
    },
  );
}
