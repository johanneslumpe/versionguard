import { deferred } from '../../src/cli/utils';
import stripAnsi from 'strip-ansi';

/**
 * Spys on `process.stdout.write`, returns a deferred promise
 * and resolves it when `needle` is found in the first argument to `write`
 * Restores `process.stdout.write` before resolving the promise
 * @param needle
 */
export function waitForStdout(needle: string): Promise<void> {
  const def = deferred();
  const mockStdout = jest
    .spyOn(process.stdout, 'write')
    .mockImplementation((str: unknown) => {
      if (typeof str === 'string' && stripAnsi(str).includes(needle)) {
        mockStdout.mockRestore();
        def.resolve();
      }
      return true;
    });
  return def.promise;
}
