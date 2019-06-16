import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { writeConfig, VersionGuardConfig } from '../../../core/config';
import {
  addDependency,
  AddDependencyChangeType,
  AddDependencyResult,
} from '../../../core/dependencies';
import { VersionGuardError } from '../../../core/errors';
import inquirer from 'inquirer';
import { tryCatch, fromEither, TaskEither } from 'fp-ts/lib/TaskEither';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';

function handleExistingDependency({
  error,
  config,
  dependency,
  groupName,
  setName,
}: {
  error: VersionGuardError;
  config: VersionGuardConfig;
  dependency: string;
  groupName: string;
  setName: string;
}): TaskEither<VersionGuardError, AddDependencyResult> {
  return tryCatch(
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
  ).chain(() =>
    fromEither(
      addDependency({
        config,
        dependency,
        groupName,
        setName,
        migrateDependency: true,
      }),
    ),
  );
}

function getMessageForChangeType({
  changeType,
  setName,
  dependency,
  groupName,
}: {
  changeType: AddDependencyChangeType;
  setName: string;
  dependency: string;
  groupName: string;
}): string {
  switch (changeType) {
    case 'ADDED_TO_SET':
      return emphasize`Dependency ${dependency} successfully added to set ${setName} within group ${groupName}`;
    case 'UPDATED_WITHIN_SET':
      return emphasize`Dependency ${dependency} successfully updated within set ${setName}`;
    case 'MIGRATED_TO_SET':
      return emphasize`Dependency ${dependency} successfully migrated to set ${setName} within group ${groupName}`;
  }
}

export function addDependencyCommand(
  yargs: ArgvWithGlobalOptions,
): ArgvWithGlobalOptions {
  return yargs.command(
    'dependencies:add <groupname> <setname> <dependency>',
    'add dependency to set within group',
    yargs =>
      yargs
        .positional('groupname', {
          describe: 'group containing dependency set',
        })
        .positional('setname', {
          describe: 'name of set to add dependency to',
        })
        .positional('dependency', {
          describe: 'dependency to add',
        })
        .string('groupname')
        .string('setname')
        .string('dependency'),
    argv => {
      const { config, groupname, setname, dependency } = argv;
      argv._asyncResult = fromEither(
        addDependency({
          config: config.contents,
          dependency,
          groupName: groupname,
          setName: setname,
        }),
      )
        .orElse(err => {
          if (
            err.errorCode ===
            VersionGuardError.codes.DEPENDENCY_EXISTS_IN_SIBLING_SET
          ) {
            return handleExistingDependency({
              error: err,
              config: config.contents,
              groupName: groupname,
              setName: setname,
              dependency,
            });
          } else {
            // forward error
            return tryCatch(
              () => {
                throw err;
              },
              err => err as VersionGuardError,
            );
          }
        })
        .chain(result =>
          writeConfig(config.path)(result.updatedConfig).map(updatedConfig =>
            HandlerResult.create(
              LogMessage.create(
                getMessageForChangeType({
                  changeType: result.changeType,
                  dependency,
                  setName: setname,
                  groupName: groupname,
                }),
              ),
              updatedConfig,
            ),
          ),
        );
    },
  );
}
