import path from 'path';
import fs from 'fs';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

import { emphasize, isNodeJSError } from '../../utils';
import { VersionGuardError } from '../../errors';

export function ensurePackageJsonsExist(
  basePath: string,
): (relativePaths: string[]) => TaskEither<VersionGuardError, string[]> {
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
              await fs.promises.stat(packageJsonPath);
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
        ).then(() => relativePaths),
      err => VersionGuardError.from(String(err)),
    );
}
