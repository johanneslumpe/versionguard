import { omit } from 'lodash/fp';
import { GroupConfig } from '../../groups';

interface FilterSetsOptions {
  dependencyName: string;
  setsContainingDependency: string[];
  groupConfig: GroupConfig;
}

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
