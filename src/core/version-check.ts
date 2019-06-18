import semver from 'semver';
import path from 'path';
import fs from 'fs';
import pluralize from 'pluralize';

import { VersionGuardConfig } from './config';
import { Dictionary } from './types';
import { getMinSemverVersion, emphasize } from './utils';
import { VersionGuardError } from './errors';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

interface PackageJson {
  dependencies?: Dictionary<string>;
  devDependencies?: Dictionary<string>;
}

export interface DependencyResult {
  dependency: string;
  currentVersion: string;
  requiredVersion: string;
  passed: boolean;
  upgradeTimeRemaining?: number;
}

interface GroupCheckResult {
  readonly passed: boolean;
  readonly applicationResults: Readonly<Dictionary<ApplicationResult>>;
}

export interface ApplicationResult {
  passed: boolean;
  dependencyResults: DependencyResult[];
}

interface CheckResult {
  passed: boolean;
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
          ? availableApplications.filter(app => applications.includes(app))
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
          applications: applicationsToCheck,
        });
        let groupPassed = true;

        for (const [, setConfig] of dependencySetsToCheck) {
          for (const dependency of Object.keys(setConfig.dependencySemvers)) {
            const [, requiredDependencyVersion] = setConfig.dependencySemvers[
              dependency
            ].semver.split('@');
            for (const application of applicationsToCheck) {
              const dependencyVersion =
                dependenciesByApplication[application][dependency];
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
                applicationDependencyResults[application] ||
                (applicationDependencyResults[application] = {
                  passed: true,
                  dependencyResults: [],
                });

              if (!dependencySatisfied) {
                groupPassed = false;
                allGroupsPassed = false;
                appResult.passed = false;
              }
              appResult.dependencyResults.push({
                dependency,
                passed: dependencySatisfied,
                currentVersion: dependencyVersion,
                requiredVersion: requiredDependencyVersion,
              });
            }
          }
        }

        groupResults[group] = {
          passed: groupPassed,
          applicationResults: applicationDependencyResults,
        };
      }

      return {
        passed: allGroupsPassed,
        groupResults,
      };
    },
    reason => VersionGuardError.from(String(reason)),
  );
}
