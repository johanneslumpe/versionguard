import { ArgvWithGlobalOptions } from '../../types';
import { pipeCommands } from '../../utils';
import { addApplicationCommand } from './add';
import { removeApplicationCommand } from './remove';

export function addApplicationCommands(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return pipeCommands(addApplicationCommand, removeApplicationCommand)(yargs);
}
