import { omit } from 'lodash/fp';

import { GroupConfig } from '../../groups';

export interface FilterSetsOptions {
  /**
   * Dependency to remove
   */
  dependencyName: string;

  /**
   * Names of sets to remove dependency from
   */
  setsContainingDependency: string[];

  /**
   * Group config to update sets in
   */
  groupConfig: GroupConfig;
}

/**
 * Removes a dependency from a given list of set names within a given group config
 */
export function filterDependenciesFromSets({
  dependencyName,
  setsContainingDependency,
  groupConfig,
}: FilterSetsOptions): GroupConfig {
  return setsContainingDependency.reduce(
    (acc, setName) => {
      const setConfig = acc.dependencies[setName];
      if (setConfig) {
        return {
          ...acc,
          dependencies: {
            ...acc.dependencies,
            [setName]: {
              ...setConfig,
              dependencySemvers: omit(
                dependencyName,
                setConfig.dependencySemvers,
              ),
            },
          },
        };
      }
      return acc;
    },
    { ...groupConfig },
  );
}
