import semver from 'semver';
import path from 'path';
import fs from 'fs';
import pluralize from 'pluralize';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

import { VersionGuardConfig } from './config';
import { Dictionary, ObjectValues, PackageJson } from './types';
import { getMinSemverVersion, emphasize } from './utils';
import { VersionGuardError } from './errors';

export const CheckResultType = {
  PASS: 'PASS',
  TENTATIVE_PASS: 'TENTATIVE_PASS',
  FAIL: 'FAIL',
} as const;

export type CheckResultType = ObjectValues<typeof CheckResultType>;

export interface DependencyResult {
  dependency: string;
  currentVersion: string;
  requiredVersion: string;
  result: CheckResultType;
  timeLeftForUpgrade: number;
  upgradeTimeRemaining?: number;
}

interface GroupCheckResult {
  result: CheckResultType;
  applicationResults: Readonly<Dictionary<ApplicationResult>>;
}

export interface ApplicationResult {
  result: CheckResultType;
  dependencyResults: DependencyResult[];
}

interface CheckResult {
  result: CheckResultType;
  groupResults: Dictionary<GroupCheckResult>;
}

async function readPackageJsons({
  configPath,
  applications,
}: {
  configPath: string;
  applications: string[];
}): Promise<Dictionary<Dictionary<string>>> {
  const packageJsons = await Promise.all(
    applications.map(application =>
      fs.promises.readFile(
        path.join(path.dirname(configPath), application, 'package.json'),
      ),
    ),
  );

  const result: Dictionary<Dictionary<string>> = {};
  return packageJsons.reduce((acc, jsonBuffer, index) => {
    const parsed: PackageJson = JSON.parse(jsonBuffer.toString());
    acc[applications[index]] = {
      ...parsed.dependencies,
      ...parsed.devDependencies,
      // TODO use peer dependencies as well?
    };
    return acc;
  }, result);
}

function invalidGroupsInvariant({
  config,
  groups,
}: {
  config: VersionGuardConfig;
  groups: string[];
}): void {
  const allGroups = Object.keys(config);
  if (groups.length) {
    const invalidGroups = groups.filter(group => !allGroups.includes(group));
    if (invalidGroups.length) {
      throw VersionGuardError.from(
        `${pluralize(
          'Group',
          invalidGroups.length,
        )} ${emphasize`${invalidGroups.join(', ')}`} not found`,
      );
    }
  }
}

export function checkDependencies({
  config,
  configPath,
  groups,
  sets,
  applications,
}: {
  config: VersionGuardConfig;
  configPath: string;
  groups: string[];
  sets: string[];
  applications: string[];
}): TaskEither<VersionGuardError, Readonly<CheckResult>> {
  return tryCatch(
    async () => {
      // TODO do not use an invariant, refactor into chainable utility
      invalidGroupsInvariant({ config, groups: groups });
      const groupResults: Dictionary<GroupCheckResult> = {};
      let allGroupsPassed = true;
      let allGroupsResult: CheckResultType = 'PASS';
      // TODO refactor all the loops
      const allEntries = Object.entries(config);
      const entriesToCheck = !groups.length
        ? allEntries
        : allEntries.filter(([group]) => groups.includes(group));

      for (const [group, groupConfig] of entriesToCheck) {
        const applicationDependencyResults: Dictionary<ApplicationResult> = {};
        const {
          applications: availableApplications,
          dependencies,
        } = groupConfig;
        const applicationsToCheck = applications.length
          ? availableApplications.filter(app => applications.includes(app.path))
          : availableApplications;
        // this group does not contain any applications we want to check
        if (!applicationsToCheck.length) {
          continue;
        }
        const availableDependencySets = Object.entries(dependencies);
        const dependencySetsToCheck = sets.length
          ? availableDependencySets.filter(([setName]) =>
              sets.includes(setName),
            )
          : availableDependencySets;
        // this group does not contain any dependency sets we want to check
        if (!dependencySetsToCheck.length) {
          continue;
        }
        const dependenciesByApplication = await readPackageJsons({
          configPath,
          applications: applicationsToCheck.map(({ path }) => path),
        });
        let groupResult: CheckResultType = 'PASS';
        let groupPassed = true;

        for (const [, setConfig] of dependencySetsToCheck) {
          const now = Date.now();
          for (const dependency of Object.keys(setConfig.dependencySemvers)) {
            const dependencyConfig = setConfig.dependencySemvers[dependency];
            const gracePeriodThreshold =
              dependencyConfig.dateAdded + setConfig.gracePeriod;
            const isWithinGracePeriod = now < gracePeriodThreshold;
            const [, requiredDependencyVersion] = dependencyConfig.semver.split(
              '@',
            );
            for (const application of applicationsToCheck) {
              const dependencyVersion =
                dependenciesByApplication[application.path][dependency];
              // TODO fix directly value access
              const { value } = getMinSemverVersion(
                dependencyVersion,
                dependency,
              );
              if (value instanceof Error) {
                throw value;
              }
              const dependencySatisfied = semver.satisfies(
                value,
                semver.validRange(requiredDependencyVersion),
              );
              const appResult =
                applicationDependencyResults[application.path] ||
                (applicationDependencyResults[application.path] = {
                  result: CheckResultType.PASS,
                  dependencyResults: [],
                });

              if (!dependencySatisfied) {
                if (groupPassed) {
                  groupPassed = isWithinGracePeriod;
                }
                if (
                  groupResult === CheckResultType.PASS ||
                  groupResult === CheckResultType.TENTATIVE_PASS
                ) {
                  groupResult = isWithinGracePeriod
                    ? CheckResultType.TENTATIVE_PASS
                    : CheckResultType.FAIL;
                }
                if (allGroupsPassed) {
                  allGroupsPassed = isWithinGracePeriod;
                }
                if (
                  allGroupsResult === CheckResultType.PASS ||
                  allGroupsResult === CheckResultType.TENTATIVE_PASS
                ) {
                  allGroupsResult = isWithinGracePeriod
                    ? CheckResultType.TENTATIVE_PASS
                    : CheckResultType.FAIL;
                }
                if (
                  appResult.result === CheckResultType.PASS ||
                  appResult.result === CheckResultType.TENTATIVE_PASS
                ) {
                  appResult.result = isWithinGracePeriod
                    ? CheckResultType.TENTATIVE_PASS
                    : CheckResultType.FAIL;
                }
              }
              appResult.dependencyResults.push({
                dependency,
                result: dependencySatisfied
                  ? CheckResultType.PASS
                  : isWithinGracePeriod
                  ? CheckResultType.TENTATIVE_PASS
                  : CheckResultType.FAIL,
                timeLeftForUpgrade: dependencySatisfied
                  ? Infinity
                  : isWithinGracePeriod
                  ? gracePeriodThreshold - now
                  : 0,
                currentVersion: dependencyVersion,
                requiredVersion: requiredDependencyVersion,
              });
            }
          }
        }

        groupResults[group] = {
          result: groupResult,
          applicationResults: applicationDependencyResults,
        };
      }

      return {
        result: allGroupsResult,
        passed: allGroupsPassed,
        groupResults,
      };
    },
    reason => VersionGuardError.from(String(reason)),
  );
}
