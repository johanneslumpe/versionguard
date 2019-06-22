import { ArgvWithGlobalOptions } from '../../types';
import { pipeCommands, PipeCommandArgs } from '../../utils';
import { addApplicationCommand } from './add';
import { removeApplicationCommand } from './remove';

export function addApplicationCommands(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return pipeCommands(addApplicationCommand, removeApplicationCommand)(opts);
}
