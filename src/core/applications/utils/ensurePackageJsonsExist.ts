import path from 'path';
import fs from 'fs';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

import { emphasize, isNodeJSError } from '../../utils';
import { VersionGuardError } from '../../errors';
import { PackageJson } from '../../types';

export function readApplicationMetaDataForPaths(
  basePath: string,
): (relativePaths: string[]) => TaskEither<VersionGuardError, PackageJson[]> {
  return relativePaths =>
    tryCatch(
      () =>
        Promise.all(
          relativePaths.map(async relativePath => {
            const packageJsonPath = path.join(
              basePath,
              relativePath,
              'package.json',
            );
            try {
              return JSON.parse(
                (await fs.promises.readFile(packageJsonPath)).toString(),
              ) as PackageJson;
            } catch (e) {
              if (isNodeJSError(e) && e.code === 'ENOENT') {
                throw VersionGuardError.from(
                  emphasize`Application in path ${path.join(
                    basePath,
                    relativePath,
                  )} does not contain a valid package.json file`,
                );
              } else {
                throw e;
              }
            }
          }),
        ),
      err => VersionGuardError.from(String(err)),
    );
}
