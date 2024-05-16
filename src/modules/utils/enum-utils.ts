import { GarbageType } from './schemas/garbage-type.enum';
import { Frequency } from './schemas/frequency.enum';

export function getEnumValues(enumObj: any): string[] {
  return Object.values(enumObj);
}

export const garbageTypeValues = getEnumValues(GarbageType);
export const frequencyValues = getEnumValues(Frequency);