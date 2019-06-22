import { TaskEither } from 'fp-ts/lib/TaskEither';

import { Logger } from '../Logger';
import { loggableTaskEither } from '../utils';
import { writeConfig as writeConfigCore, VersionGuardConfig } from '../../core';
import { VersionGuardError } from '../../core/errors';
import { LogMessage } from '../LogMessage';

export function writeConfig(
  path: string,
  logger: Logger,
): (
  data: VersionGuardConfig,
) => TaskEither<VersionGuardError, VersionGuardConfig> {
  return loggableTaskEither(
    writeConfigCore(path),
    () => LogMessage.info('Writing config...'),
    () => LogMessage.info('Config written!'),
    logger,
  );
}
