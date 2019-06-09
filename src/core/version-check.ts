import semver from 'semver';
import path from 'path';
import fs from 'fs';
import pluralize from 'pluralize';

import { VersionGuardConfig } from './config';
import { Dictionary } from './types';
import { getMinSemverVersionOrThrow, emphasize } from './utils';
import { VersionGuardError } from './errors';

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
  availableGroups,
}: {
  config: VersionGuardConfig;
  availableGroups: string[];
}): void {
  const allGroups = Object.keys(config);
  if (availableGroups.length) {
    const invalidGroups = availableGroups.filter(
      group => !allGroups.includes(group),
    );
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

export async function checkDependencies({
  config,
  configPath,
  groupsToCheck,
}: {
  config: VersionGuardConfig;
  configPath: string;
  groupsToCheck: string[];
}): Promise<Readonly<CheckResult>> {
  const availableGroups = Object.keys(config);
  invalidGroupsInvariant({ config, availableGroups });
  const groups = availableGroups.filter(
    group => !groupsToCheck.length || groupsToCheck.includes(group),
  );
  const groupResults: Dictionary<GroupCheckResult> = {};
  const applicationDependencyResults: Dictionary<ApplicationResult> = {};
  let allGroupsPassed = true;
  // TODO refactor
  for (const group of groups) {
    const groupConfig = config[group];
    const { applications, dependencies } = groupConfig;
    const dependenciesByApplication = await readPackageJsons({
      configPath,
      applications,
    });
    const dependencySets = Object.keys(dependencies);
    let groupPassed = true;
    for (const setKey of dependencySets) {
      const setConfig = dependencies[setKey];
      for (const dependency of Object.keys(setConfig.dependencySemvers)) {
        const [, requiredDependencyVersion] = setConfig.dependencySemvers[
          dependency
        ].semver.split('@');
        for (const application of applications) {
          const dependencyVersion =
            dependenciesByApplication[application][dependency];
          const dependencySatisfied = semver.satisfies(
            getMinSemverVersionOrThrow(dependencyVersion, dependency),
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
}
