import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import { success, info } from '../../logger';
import { writeConfig, VersionGuardConfig } from '../../../core/config';
import {
  addDependency,
  AddDependencyChangeType,
  AddDependencyResult,
} from '../../../core/dependencies';
import { VersionGuardError } from '../../../core/errors';
import { isVersionGuardErrorType } from '../../utils';
import inquirer from 'inquirer';

async function handleExistingDependency({
  error,
  config,
  dependency,
  groupName,
  setName,
}: {
  error: Error;
  config: VersionGuardConfig;
  dependency: string;
  groupName: string;
  setName: string;
}): Promise<AddDependencyResult | void> {
  if (
    isVersionGuardErrorType(
      error,
      VersionGuardError.codes.DEPENDENCY_EXISTS_IN_SIBLING_SET,
    )
  ) {
    const answer = await inquirer.prompt<{ shouldMigrate: boolean }>([
      {
        name: 'shouldMigrate',
        type: 'confirm',
        message: `${error.message}\nWould you like to migrate the dependency?`,
        default: true,
      },
    ]);

    if (answer.shouldMigrate) {
      return addDependency({
        config,
        dependency,
        groupName,
        setName,
        migrateDependency: true,
      });
    }
  } else {
    throw error;
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
      argv._asyncResult = (async () => {
        const { config, groupname, setname, dependency } = argv;
        let updatedConfig: VersionGuardConfig | undefined = undefined;
        let changeType: AddDependencyChangeType = 'ADDED_TO_SET';
        try {
          const result = addDependency({
            config: config.contents,
            dependency,
            groupName: groupname,
            setName: setname,
          });
          updatedConfig = result.updatedConfig;
          changeType = result.changeType;
        } catch (e) {
          const result = await handleExistingDependency({
            error: e,
            config: config.contents,
            groupName: groupname,
            setName: setname,
            dependency,
          });
          if (result) {
            updatedConfig = result.updatedConfig;
            changeType = result.changeType;
          }
        }

        if (updatedConfig) {
          await writeConfig(config.path, updatedConfig);
          switch (changeType) {
            case 'ADDED_TO_SET':
              success(
                emphasize`Dependency ${dependency} successfully added to set ${setname} within group ${groupname}`,
              );
              break;
            case 'UPDATED_WITHIN_SET':
              success(
                emphasize`Dependency ${dependency} successfully updated within set ${setname}`,
              );
              break;
            case 'MIGRATED_TO_SET':
              success(
                emphasize`Dependency ${dependency} successfully migrated to set ${setname} within group ${groupname}`,
              );
              break;
          }
        } else {
          info(emphasize`Adding of dependency ${dependency} aborted`);
        }
      })();
    },
  );
}
