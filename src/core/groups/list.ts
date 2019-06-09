import { VersionGuardConfig } from '../config';

export function getGroupList(config: VersionGuardConfig): string[] {
  return Object.keys(config).sort();
}
