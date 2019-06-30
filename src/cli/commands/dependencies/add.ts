import { map, left2v } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain, orElse } from 'fp-ts/lib/TaskEither';

import { ArgvWithGlobalOptions } from '../../types';
import { emphasize } from '../../../core/utils';
import {
  addDependency,
  handleExistingDependency,
} from '../../core/dependencies';
import { VersionGuardError } from '../../../core/errors';
import { HandlerResult } from '../../HandlerResult';
import { LogMessage } from '../../LogMessage';
import { AddDependencyChangeType } from '../../../core/dependencies/utils/getGroupConfigWithCleanedDependencySetsAndChangeType';
import {
  PipeCommandArgs,
  convertInternalDependencyToPublicDependency,
} from '../../utils';
import { writeConfig } from '../../core/config';

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
  opts: PipeCommandArgs,
): ArgvWithGlobalOptions {
  return opts.cli.command(
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
      argv._asyncResult = pipe(
        addDependency({
          dependency,
          groupName: groupname,
          setName: setname,
          logger: opts.logger,
        })(config.contents),
        orElse(err =>
          err.errorCode ===
          VersionGuardError.codes.DEPENDENCY_EXISTS_IN_SIBLING_SET
            ? handleExistingDependency({
                error: err,
                groupName: groupname,
                setName: setname,
                dependency,
                logger: opts.logger,
              })(config.contents)
            : left2v(err),
        ),
        chain(result =>
          pipe(
            writeConfig(config.path, opts.logger)(result.updatedConfig),
            map(updatedConfig =>
              HandlerResult.create(
                LogMessage.success(
                  getMessageForChangeType({
                    changeType: result.changeType,
                    dependency,
                    setName: setname,
                    groupName: groupname,
                  }),
                ),
                {
                  type: 'DEPENDENCY:ADD_TO_SET',
                  result: {
                    group: groupname,
                    dependencySet: setname,
                    dependency: convertInternalDependencyToPublicDependency(
                      updatedConfig[groupname].dependencies[setname]
                        .dependencySemvers[dependency.split('@')[0].trim()],
                    ),
                  },
                },
              ),
            ),
          ),
        ),
      );
    },
  );
}
