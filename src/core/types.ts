export type ObjectValues<T> = T extends object ? T[keyof T] : never;
export interface Dictionary<T> {
  [index: string]: T;
}

export interface DependencyConfig {
  dateAdded: number;
  semver: string;
}

export interface DependencySetConfig {
  dependencySemvers: Dictionary<DependencyConfig>;
  gracePeriod: number;
}

export interface PackageJson {
  name: string;
  dependencies?: Dictionary<string>;
  devDependencies?: Dictionary<string>;
}
