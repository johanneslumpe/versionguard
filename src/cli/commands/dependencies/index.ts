import { ArgvWithGlobalOptions } from '../../types';
import { pipeCommands } from '../../utils';
import { addDependencyCommand } from './add';
import { deleteDependencySetCommand } from './delete-set';
import { createDependencySetCommand } from './create-set';
import { removeDependencyCommand } from './remove';

export function addDependencyCommands(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return pipeCommands(
    addDependencyCommand,
    createDependencySetCommand,
    deleteDependencySetCommand,
    removeDependencyCommand,
  )(yargs);
}
