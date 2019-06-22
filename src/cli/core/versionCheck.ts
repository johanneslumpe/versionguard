import { TaskEither } from 'fp-ts/lib/TaskEither';
import { HorizontalTable, HorizontalTableRow } from 'cli-table3';
import chalk from 'chalk';
import logSymbols from 'log-symbols';

import { Logger } from '../Logger';
import { LogMessage } from '../LogMessage';
import { Config } from '../types';
import {
  checkDependencies,
  DependencyResult,
  ApplicationResult,
  CheckResultType,
  CheckResult,
} from '../../core/versionCheck';
import { VersionGuardError } from '../../core/errors';
import {
  getHorizontalTableWithHeaders,
  getLogSymbolForStatus,
  formatDuration,
  loggableTaskEither,
} from '../utils';
import { Dictionary } from '../../core/types';

function colorTextForStatus(
  content: string,
  checkResultType: CheckResultType,
): string {
  switch (checkResultType) {
    case 'PASS':
      return chalk.green(content);
    case 'TENTATIVE_PASS':
      return chalk.yellow(content);
    case 'FAIL':
      return chalk.red(content);
  }
}

function getDependencyResultRow(result: DependencyResult): HorizontalTableRow {
  return [
    colorTextForStatus(result.dependency, result.result),
    colorTextForStatus(result.currentVersion || '-', result.result),
    colorTextForStatus(result.requiredVersion, result.result),
    result.result === 'TENTATIVE_PASS'
      ? `${logSymbols.warning} ${formatDuration(
          result.timeLeftForUpgrade,
        )} left to upgrade`
      : getLogSymbolForStatus(result.result === 'PASS'),
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

export function checkDependencyVersions({
  groups,
  sets,
  applications,
  logger,
}: {
  groups: string[];
  sets: string[];
  applications: string[];
  logger: Logger;
}): (
  data: Config['config'],
) => TaskEither<VersionGuardError, Readonly<CheckResult>> {
  return loggableTaskEither(
    config =>
      checkDependencies({
        config: config.contents,
        configPath: config.path,
        groups,
        sets,
        applications,
      }),
    () => LogMessage.info(`Checking dependencies...`),
    result => {
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
      return LogMessage.plain(`${tables.map(t => t.toString()).join('\n')}`);
    },
    logger,
  );
}
