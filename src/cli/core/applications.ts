import { TaskEither } from 'fp-ts/lib/TaskEither';
import pluralize from 'pluralize';

import { loggableTaskEither } from '../utils';
import {
  addApplications as addApplicationsCore,
  removeApplication,
} from '../../core/applications';
import { Logger } from '../Logger';
import { VersionGuardError } from '../../core/errors';
import { VersionGuardConfig } from '../../core';
import { emphasize } from '../../core/utils';
import { LogMessage } from '../LogMessage';

export function addApplications({
  groupName,
  configPath,
  relativePaths,
  logger,
}: {
  groupName: string;
  configPath: string;
  relativePaths: string[];
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    d =>
      addApplicationsCore({
        config: d,
        groupName,
        configPath,
        relativePaths,
      }),
    () =>
      LogMessage.info(
        emphasize`Attempting to add ${pluralize(
          'Application',
          relativePaths.length,
        )} in ${pluralize('path', relativePaths.length)} ${relativePaths.join(
          ', ',
        )}...`,
      ),
    () =>
      LogMessage.info(
        `${pluralize('Application', relativePaths.length)} added!`,
      ),
    logger,
  );
}

export function removeApplications({
  groupName,
  configPath,
  relativePaths,
  logger,
}: {
  groupName: string;
  configPath: string;
  relativePaths: string[];
  logger: Logger;
}): (
  config: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    d =>
      removeApplication({
        config: d,
        groupName,
        configPath,
        relativePaths,
      }),
    () =>
      LogMessage.info(
        emphasize`Attempting to remove ${pluralize(
          'Application',
          relativePaths.length,
        )} in ${pluralize('path', relativePaths.length)} ${relativePaths.join(
          ', ',
        )}...`,
      ),
    () =>
      LogMessage.info(
        `${pluralize('Application', relativePaths.length)} removed!`,
      ),
    logger,
  );
}
