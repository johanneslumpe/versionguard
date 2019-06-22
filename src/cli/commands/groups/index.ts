import { pipeCommands, PipeCommandArgs } from '../../utils';
import { removeGroupCommand } from './remove';
import { renameGroupCommand } from './rename';
import { listGroupsCommand } from './list';
import { ArgvWithGlobalOptions } from '../../types';
import { addGroupCommand } from './add';
import { groupInfoCommand } from './info';

export function addGroupCommands(opts: PipeCommandArgs): ArgvWithGlobalOptions {
  return pipeCommands(
    addGroupCommand,
    removeGroupCommand,
    renameGroupCommand,
    listGroupsCommand,
    groupInfoCommand,
  )(opts);
}
