import chalk from 'chalk';
import { CrossTableRow } from 'cli-table3';
import { fromEither, map } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { ArgvWithGlobalOptions } from '../../types';
import { getGroupConfig } from '../../../core/utils';
import { GroupConfig } from '../../../core/groups';
import { getCrossTableWithHeaders, formatDuration } from '../../utils';
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
          : formatDuration(setConfig.gracePeriod),
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
      argv._asyncResult = pipe(
        fromEither(getGroupConfig(groupname, argv.config.contents)),
        map(groupConfig => {
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
              )}${groupConfig.applications
                .map(
                  ({ name, path }) =>
                    `${name}${path !== name ? ` (${path})` : ''}`,
                )
                .join(', ')}\n\n${chalk.bold(
                'Dependency sets',
              )}\n${dependencySetTable.toString()}`.trim(),
            ),
            groupConfig,
          );
        }),
      );
    },
  );
}
