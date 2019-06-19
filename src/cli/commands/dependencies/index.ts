import { ArgvWithGlobalOptions } from '../../types';
import { pipeCommands } from '../../utils';
import { addDependencyCommand } from './add';
import { deleteDependencySetCommand } from './deleteSet';
import { createDependencySetCommand } from './createSet';
import { removeDependencyCommand } from './remove';
import { setGracePeriodCommand } from './setGracePeriod';

export function addDependencyCommands(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return pipeCommands(
    addDependencyCommand,
    createDependencySetCommand,
    deleteDependencySetCommand,
    removeDependencyCommand,
    setGracePeriodCommand,
  )(yargs);
}
