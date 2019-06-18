import chalk from 'chalk';
import semver from 'semver';
import path from 'path';
import { left, Either, right, tryCatch } from 'fp-ts/lib/Either';

import { VersionGuardConfig } from './config';
import { GroupConfig } from './groups';
import { VersionGuardError } from './errors';
import { DependencySetConfig } from './types';

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
): Either<VersionGuardError, GroupConfig> {
  const groupConfig = config[groupName];
  if (!groupConfig) {
    return left(
      VersionGuardError.from(emphasize`Group ${groupName} does not exist!`),
    );
  }
  return right(groupConfig);
}

export function getDependencySetConfig(
  setName: string,
  config: GroupConfig,
): Either<VersionGuardError, DependencySetConfig> {
  const setConfig = config.dependencies[setName];
  if (!setConfig) {
    return left(
      VersionGuardError.from(
        emphasize`Dependency set ${setName} does not exist!`,
      ),
    );
  }

  return right(setConfig);
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

export function getMinSemverVersion(
  version: string,
  dependencyName: string,
): Either<VersionGuardError, semver.SemVer> {
  return tryCatch(
    () => {
      const v = semver.minVersion(version);
      // checking for `version` here too, to ensure
      // that empty version are caught. `minVersion` will not fail on an empty version
      // but return a SemVer object for version `0.0.0` instead.
      if (!version || !v) {
        throw new Error('invalid version');
      }
      return v;
    },
    () =>
      VersionGuardError.from(
        emphasize`${version} for ${dependencyName} is not a valid semver range`,
      ),
  );
}

export function normalizePaths({
  configPath,
  relativePaths,
}: {
  configPath: string;
  relativePaths: string[];
}): string[] {
  const configBase = path.dirname(configPath);
  const paths = relativePaths.map(p =>
    // combining `path.resolve` with `path.relative` in this way
    // gets rid of any trailing slashes that may exist on `p`
    path.relative(configBase, path.resolve(configBase, p)),
  );
  return paths;
}
