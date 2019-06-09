import { DependencySetConfig } from '../create-set';
import { Dictionary } from '../../types';

export function findSetsContainingDependency(
  dependencyName: string,
  config: Dictionary<DependencySetConfig>,
): string[] {
  return Object.keys(config).filter(key => {
    const setConfig = config[key];
    return (
      !!setConfig &&
      Object.keys(setConfig.dependencySemvers).find(
        key => key === dependencyName,
      )
    );
  });
}
