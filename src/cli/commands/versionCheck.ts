import pluralize from 'pluralize';
import { pipe } from 'fp-ts/lib/pipeable';
import { tryCatch, chain } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../types';
import { VersionGuardError } from '../../core/errors';
import {
  PipeCommandArgs,
  convertCheckResultToPublicCheckResult,
} from '../utils';
import { emphasize } from '../../core/utils';
import { HandlerResult } from '../HandlerResult';
import { LogMessage } from '../LogMessage';
import { checkDependencyVersions } from '../core/versionCheck';

export function versionCheckCommand(
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
    'check',
    'check dependencies for given groups',
    yargs =>
      yargs.options({
        group: {
          array: true,
          description: 'groups to check',
          type: 'string',
          default: [] as string[],
        },
        app: {
          array: true,
          description: 'applications to check',
          type: 'string',
          default: [] as string[],
        },
        set: {
          array: true,
          description: 'sets to check',
          type: 'string',
          default: [] as string[],
        },
      }),
    argv => {
      const { config, group, set, app } = argv;
      argv._asyncResult = pipe(
        checkDependencyVersions({
          groups: group,
          sets: set,
          applications: app,
          logger: opts.logger,
        })(config),
        chain(result => {
          // TODO refactor this to be less imperative
          return tryCatch(
            async () => {
              if (result.result === 'FAIL') {
                const groups = Object.entries(result.groupResults);
                const failedGroups = groups
                  .filter(([, groupResult]) => groupResult.result === 'FAIL')
                  .map(([group]) => group);
                throw VersionGuardError.from(
                  `${pluralize(
                    'Group',
                    failedGroups.length,
                  )} ${emphasize`${failedGroups.join(
                    ', ',
                  )} did not meet dependency version requirements`}`,
                );
              }
              return HandlerResult.create(
                result.result === 'PASS'
                  ? LogMessage.success(`Check passed!`)
                  : LogMessage.warning(`Check tentatively passed!`),
                {
                  type: 'VERSIONCHECK',
                  result: convertCheckResultToPublicCheckResult(result),
                },
              );
            },
            (err: unknown) => err as VersionGuardError,
          );
        }),
      );
    },
  );
}
