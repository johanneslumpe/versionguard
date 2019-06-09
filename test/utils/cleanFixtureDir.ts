import fs from 'fs';
import glob from 'glob';
import util from 'util';

const asyncGlob = util.promisify(glob);

export async function cleanFixtureDir(fixtureDir: string): Promise<void> {
  const result = await asyncGlob('**/copied_config_fixture_*.json', {
    root: fixtureDir,
  });
  await Promise.all(result.map(filename => fs.promises.unlink(filename)));
}
