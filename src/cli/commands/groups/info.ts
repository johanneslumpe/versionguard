import chalk from 'chalk';
import humanizeDuration from 'humanize-duration';
import { CrossTableRow } from 'cli-table3';

import { ArgvWithGlobalOptions } from '../../types';
import { getGroupConfig } from '../../../core/utils';
import { info } from '../../logger';
import { GroupConfig } from '../../../core/groups';
import { getCrossTableWithHeaders } from '../../utils';

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
      argv._asyncResult = (async () => {
        const { groupname } = argv;
        const groupConfig = getGroupConfig(groupname, argv.config.contents);
        const applications = groupConfig.applications.join(', ');
        const dependencySetTable = getCrossTableWithHeaders([
          '',
          'Dependencies',
          'Grace period',
        ]);
        dependencySetTable.push(...getDependencySetTableRows(groupConfig));
        info(
          `${chalk.bold(`${groupname}\n\n`)}${chalk.bold(
            'Applications: ',
          )}${applications}\n\n${chalk.bold(
            'Dependency sets',
          )}\n${dependencySetTable.toString()}`.trim(),
        );
      })();
    },
  );
}
