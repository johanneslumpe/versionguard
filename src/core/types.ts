export type ObjectValues<T> = T extends object ? T[keyof T] : never;
export interface Dictionary<T> {
  [index: string]: T;
}
