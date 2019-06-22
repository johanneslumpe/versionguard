import { TaskEither, fromEither, tryCatch, chain } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import inquirer from 'inquirer';

import { loggableTaskEither } from '../utils';
import {
  createDependencySetInGroup as createDependencySetInGroupCore,
  deleteDependencySetFromGroup as deleteDependencySetFromGroupCore,
  removeDependency as removeDependencyCore,
  setGracePeriod as setGracePeriodCore,
  addDependency as addDependencyCore,
  AddDependencyResult,
} from '../../core/dependencies';
import { Logger } from '../Logger';
import { VersionGuardError } from '../../core/errors';
import { VersionGuardConfig } from '../../core';
import { emphasize } from '../../core/utils';
import { LogMessage } from '../LogMessage';

export function addDependency({
  groupName,
  setName,
  dependency,
  migrateDependency,
  logger,
}: {
  groupName: string;
  setName: string;
  dependency: string;
  migrateDependency?: boolean;
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, AddDependencyResult> {
  return loggableTaskEither(
    config =>
      fromEither(
        addDependencyCore({
          config,
          dependency,
          groupName,
          setName,
          migrateDependency,
        }),
      ),
    () =>
      LogMessage.info(emphasize`Attempting to add dependency ${dependency}...`),
    () => LogMessage.info('Dependency added!'),
    logger,
  );
}

export function handleExistingDependency({
  error,
  dependency,
  groupName,
  setName,
  logger,
}: {
  error: VersionGuardError;
  dependency: string;
  groupName: string;
  setName: string;
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, AddDependencyResult> {
  return loggableTaskEither(
    config =>
      pipe(
        tryCatch(
          async () => {
            const { shouldMigrate } = await inquirer.prompt<{
              shouldMigrate: boolean;
            }>([
              {
                name: 'shouldMigrate',
                type: 'confirm',
                message: `${error.message}\nWould you like to migrate the dependency?`,
                default: true,
              },
            ]);

            if (shouldMigrate) {
              return shouldMigrate;
            } else {
              throw new Error('aborted');
            }
          },
          () =>
            VersionGuardError.from(
              emphasize`Adding of dependency ${dependency} aborted`,
            ),
        ),
        chain(() =>
          addDependency({
            dependency,
            groupName,
            setName,
            migrateDependency: true,
            logger,
          })(config),
        ),
      ),
    () =>
      LogMessage.info(
        emphasize`Attempting to migrate dependency ${dependency}`,
      ),
    () => LogMessage.info('Dependency migrated!'),
    logger,
  );
}

export function removeDependency({
  groupName,
  setName,
  dependency,
  logger,
}: {
  groupName: string;
  setName: string;
  dependency: string;
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    config =>
      fromEither(
        removeDependencyCore({
          config,
          dependency,
          groupName,
          setName,
        }),
      ),
    () =>
      LogMessage.info(
        emphasize`Attempting to remove dependency ${dependency} from set ${setName} within group ${groupName}...`,
      ),
    () => LogMessage.info('Dependency removed!'),
    logger,
  );
}

export function createDependencySetInGroup({
  groupName,
  setName,
  logger,
}: {
  groupName: string;
  setName: string;
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    d =>
      fromEither(
        createDependencySetInGroupCore({
          config: d,
          groupName,
          setName,
        }),
      ),
    () =>
      LogMessage.info(
        emphasize`Attempting to create dependency set ${setName}...`,
      ),
    () => LogMessage.info('Set created!'),
    logger,
  );
}

export function deleteDependencySetFromGroup({
  groupName,
  setName,
  logger,
}: {
  groupName: string;
  setName: string;
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    config =>
      fromEither(
        deleteDependencySetFromGroupCore({
          config,
          groupName,
          setName,
        }),
      ),
    () =>
      LogMessage.info(
        emphasize`Attempting to delete dependency set ${setName} from group ${groupName}...`,
      ),
    () => LogMessage.info('Set deleted!'),
    logger,
  );
}

export function setGracePeriod({
  groupName,
  setName,
  gracePeriod,
  logger,
}: {
  groupName: string;
  setName: string;
  gracePeriod: string;
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    config =>
      fromEither(
        setGracePeriodCore({
          config,
          groupName,
          setName,
          gracePeriod,
        }),
      ),
    () =>
      LogMessage.info(
        emphasize`Attempting to set grace period for set ${setName} within group ${groupName}...`,
      ),
    () =>
      LogMessage.info(
        emphasize`Grace period for dependency set ${setName} updated`,
      ),
    logger,
  );
}
