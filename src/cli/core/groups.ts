import { TaskEither, fromEither } from 'fp-ts/lib/TaskEither';

import { loggableTaskEither } from '../utils';
import {
  addGroup as addGroupCore,
  getGroupList,
  removeGroup as removeGroupCore,
  renameGroup as renameGroupCore,
} from '../../core/groups';
import { Logger } from '../Logger';
import { VersionGuardError } from '../../core/errors';
import { VersionGuardConfig } from '../../core';
import { emphasize } from '../../core/utils';
import { LogMessage } from '../LogMessage';

export function addGroup(
  groupName: string,
  logger: Logger,
): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    d => fromEither(addGroupCore(groupName, d)),
    () => LogMessage.info(emphasize`Attempting to add group ${groupName}...`),
    () => LogMessage.info('Group added!'),
    logger,
  );
}

export function listGroups(
  logger: Logger,
): (config: VersionGuardConfig) => TaskEither<VersionGuardError, string[]> {
  return loggableTaskEither(
    d => fromEither(getGroupList(d)),
    () => LogMessage.info('Fetching group list...'),
    () => LogMessage.info('Got group list!'),
    logger,
  );
}

export function removeGroup(
  groupName: string,
  logger: Logger,
): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    d => fromEither(removeGroupCore(groupName, d)),
    () =>
      LogMessage.info(emphasize`Attempting to remove group ${groupName}...`),
    () => LogMessage.info('Group removed!'),
    logger,
  );
}

export function renameGroup(
  oldName: string,
  newName: string,
  logger: Logger,
): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    d => fromEither(renameGroupCore(oldName, newName, d)),
    () => LogMessage.info(emphasize`Attempting to rename group ${oldName}...`),
    () => LogMessage.info('Group renamed!'),
    logger,
  );
}
