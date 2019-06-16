import chalk from 'chalk';
import humanizeDuration from 'humanize-duration';
import { CrossTableRow } from 'cli-table3';

import { ArgvWithGlobalOptions } from '../../types';
import { getGroupConfig } from '../../../core/utils';
import { GroupConfig } from '../../../core/groups';
import { getCrossTableWithHeaders } from '../../utils';
import { fromEither } from 'fp-ts/lib/TaskEither';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

function getDependencySetTableRows(groupConfig: GroupConfig): CrossTableRow[] {
  return Object.keys(groupConfig.dependencies).map(set => {
    const setConfig = groupConfig.dependencies[set];
    return {
      [set]: [
        Object.entries(setConfig.dependencySemvers)
          .map(([, entry]) => entry.semver)
          .join(', '),
        setConfig.gracePeriod === Infinity
          ? Infinity.toString()
          : humanizeDuration(setConfig.gracePeriod, {
              units: ['d', 'h'],
            }),
      ],
    };
  });
}

export function groupInfoCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'groups:info <groupname>',
    'show group details',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'group to show details for',
        })
        .string('groupname'),
    argv => {
      const { groupname } = argv;
      argv._asyncResult = fromEither(
        getGroupConfig(groupname, argv.config.contents),
      ).map(groupConfig => {
        const dependencySetTable = getCrossTableWithHeaders([
          '',
          'Dependencies',
          'Grace period',
        ]);
        dependencySetTable.push(...getDependencySetTableRows(groupConfig));
        return HandlerResult.create(
          LogMessage.create(
            `${chalk.bold(`${groupname}\n\n`)}${chalk.bold(
              'Applications: ',
            )}${groupConfig.applications.join(', ')}\n\n${chalk.bold(
              'Dependency sets',
            )}\n${dependencySetTable.toString()}`.trim(),
          ),
          groupConfig,
        );
      });
    },
  );
}
