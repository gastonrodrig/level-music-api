import { ServiceItem } from '../../types';

export const parseServices = (input: any): ServiceItem[] => {
  if (input == null) return [];

  if (Array.isArray(input)) {
    if (input.length === 1 && typeof input[0] === 'string') {
      const parsed = safeParseArray(input[0]);
      return parsed;
    }
    return input as ServiceItem[];
  }

  if (typeof input === 'string') {
    return safeParseArray(input);
  }

  return [];
}

const safeParseArray = (str: string): ServiceItem[] => {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? (val as ServiceItem[]) : [];
  } catch {
    return [];
  }
}