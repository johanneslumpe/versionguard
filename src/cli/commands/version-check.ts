import { HorizontalTable, HorizontalTableRow } from 'cli-table3';
import chalk from 'chalk';
import pluralize from 'pluralize';
import humanizeDuration from 'humanize-duration';
import logSymbols = require('log-symbols');

import { ArgvWithGlobalOptions } from '../types';
import {
  checkDependencies,
  DependencyResult,
  ApplicationResult,
} from '../../core/version-check';
import { VersionGuardError } from '../../core/errors';
import { getHorizontalTableWithHeaders, getLogSymbolForStatus } from '../utils';
import { Dictionary } from '../../core/types';
import { emphasize } from '../../core/utils';
import { tryCatch } from 'fp-ts/lib/TaskEither';
import { HandlerResult } from '../HandlerResult';
import { LogMessage } from '../LogMessage';

function colorTextForStatus(content: string, passed: boolean): string {
  return (passed ? chalk.green : chalk.red)(content);
}

function getDependencyResultRow(result: DependencyResult): HorizontalTableRow {
  return [
    colorTextForStatus(result.dependency, result.passed),
    colorTextForStatus(result.currentVersion, result.passed),
    colorTextForStatus(result.requiredVersion, result.passed),
    result.result === 'TENTATIVE_PASS'
      ? `${logSymbols.warning} ${humanizeDuration(result.timeLeftForUpgrade, {
          units: ['d', 'h'],
        })} left to upgrade`
      : getLogSymbolForStatus(result.passed),
  ];
}

function createApplicationResultRow(
  application: string,
  result: ApplicationResult,
): HorizontalTableRow[] {
  if (!result.dependencyResults.length) {
    return [];
  }
  return [
    [
      {
        rowSpan: result.dependencyResults.length,
        content: application,
      },
      ...getDependencyResultRow(result.dependencyResults[0]),
    ],
    ...result.dependencyResults.slice(1).map(getDependencyResultRow),
  ];
}

function createApplicationResultRows(
  applicationResults: Dictionary<ApplicationResult>,
): HorizontalTableRow[] {
  return Object.entries(applicationResults).reduce(
    (acc, entry) => [...acc, ...createApplicationResultRow(...entry)],
    [] as HorizontalTableRow[],
  );
}

export function versionCheckCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
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
      const { config, verbose, group, set, app } = argv;
      argv._asyncResult = checkDependencies({
        config: config.contents,
        configPath: config.path,
        groups: group,
        sets: set,
        applications: app,
      }).chain(result => {
        let verboseResult = '';
        if (verbose) {
          const tables = Object.entries(result.groupResults).reduce(
            (acc, [, groupResult]) => {
              const resultTable = getHorizontalTableWithHeaders([
                'Application',
                'Dependency',
                'Installed',
                'Required',
                'Valid',
              ]);
              resultTable.push(
                ...createApplicationResultRows(groupResult.applicationResults),
              );
              return [...acc, resultTable];
            },
            [] as HorizontalTable[],
          );
          verboseResult = `\n${tables.map(t => t.toString()).join('\n')}\n`;
        }

        // TODO refactor this to be less imperative
        return tryCatch(
          async () => {
            if (result.result === 'FAIL') {
              const groups = Object.entries(result.groupResults);
              const failedGroups = groups
                .filter(([, groupResult]) => !groupResult.passed)
                .map(([group]) => group);
              throw VersionGuardError.from(
                `${verboseResult}${pluralize(
                  'Group',
                  failedGroups.length,
                )} ${emphasize`${failedGroups.join(
                  ', ',
                )} did not meet dependency version requirements`}`,
              );
            }

            return HandlerResult.create(
              result.result === 'PASS'
                ? LogMessage.create(`${verboseResult}Check passed!`)
                : LogMessage.create(
                    `${verboseResult}Check tentatively passed!`,
                    'warning',
                  ),
              result,
            );
          },
          (err: unknown) => err as VersionGuardError,
        );
      });
    },
  );
}
