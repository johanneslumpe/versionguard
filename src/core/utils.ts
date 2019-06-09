import chalk from 'chalk';
import semver, { SemVer } from 'semver';

import { VersionGuardConfig } from './config';
import { GroupConfig } from './groups';
import { DependencySetConfig } from './dependencies';
import { VersionGuardError } from './errors';

function emphasized(str: string): string {
  return chalk.underline.bold(str);
}

export function emphasize(
  strings: TemplateStringsArray,
  ...interpolations: string[]
): string {
  return strings.reduce((acc, str, index) => {
    const interpolation =
      interpolations[index] !== undefined ? interpolations[index] : '';
    return `${acc}${str}${emphasized(interpolation)}`;
  }, '');
}

export function getGroupConfig(
  groupName: string,
  config: VersionGuardConfig,
): GroupConfig {
  const groupConfig = config[groupName];
  if (!groupConfig) {
    throw VersionGuardError.from(emphasize`Group ${groupName} does not exist!`);
  }
  return groupConfig;
}

export function getDependencySetConfig(
  setName: string,
  config: GroupConfig,
): DependencySetConfig {
  const setConfig = config.dependencies[setName];
  if (!setConfig) {
    throw VersionGuardError.from(
      emphasize`Dependency set ${setName} does not exist!`,
    );
  }

  return setConfig;
}

const { hasOwnProperty } = Object.prototype;
export function isNodeJSError(err: Error): err is NodeJS.ErrnoException {
  return (
    err &&
    typeof err === 'object' &&
    hasOwnProperty.call(err, 'code') &&
    hasOwnProperty.call(err, 'errno')
  );
}

function getMinSemverVersion(version: string): semver.SemVer | null {
  try {
    return (!!version && semver.minVersion(version)) || null;
  } catch (e) {
    return null;
  }
}

export function getMinSemverVersionOrThrow(
  version: string,
  dependencyName: string,
): semver.SemVer {
  const minVersion = getMinSemverVersion(version);
  if (!minVersion) {
    throw VersionGuardError.from(
      emphasize`${version} for ${dependencyName} is not a valid semver range`,
    );
  }
  return minVersion;
}
