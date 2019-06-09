import { HorizontalTable, HorizontalTableRow } from 'cli-table3';
import logSymbols from 'log-symbols';
import chalk from 'chalk';
import pluralize from 'pluralize';

import { ArgvWithGlobalOptions } from '../types';
import {
  checkDependencies,
  DependencyResult,
  ApplicationResult,
} from '../../core/version-check';
import { success, info } from '../logger';
import { VersionGuardError } from '../../core/errors';
import { getHorizontalTableWithHeaders } from '../utils';
import { Dictionary } from '../../core/types';
import { emphasize } from '../../core/utils';

function getSymbolForStatus(passed: boolean): string {
  return passed ? logSymbols.success : logSymbols.error;
}

function colorTextForStatus(content: string, passed: boolean): string {
  return (passed ? chalk.green : chalk.red)(content);
}

function getDependencyResultRow(result: DependencyResult): HorizontalTableRow {
  return [
    colorTextForStatus(result.dependency, result.passed),
    colorTextForStatus(result.currentVersion, result.passed),
    colorTextForStatus(result.requiredVersion, result.passed),
    getSymbolForStatus(result.passed),
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
    'check [groups..]',
    'check dependencies for given groups',
    yargs =>
      yargs
        .positional('groups', {
          describe: 'groups to check dependencies for',
        })
        .string('groups')
        .array('groups'),
    argv => {
      argv._asyncResult = (async () => {
        const { config, verbose, groups } = argv;
        const result = await checkDependencies({
          config: config.contents,
          configPath: config.path,
          groupsToCheck: groups,
        });

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
          info(`\n${tables.map(t => t.toString()).join('\n')}`);
        }

        if (!result.passed) {
          const groups = Object.keys(result.groupResults);
          throw VersionGuardError.from(
            `${pluralize('Group', groups.length)} ${emphasize`${groups.join(
              ', ',
            )} did not meet dependency version requirements`}`,
          );
        } else {
          success('Check passed!');
        }
      })();
    },
  );
}
