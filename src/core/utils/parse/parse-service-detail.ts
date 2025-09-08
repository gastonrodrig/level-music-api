import { DetailServiceItem } from '../../types';

export const parseDetailService = (input: any): DetailServiceItem => {
  if (!input) return null;

  if (typeof input === 'string') {
    return safeParseDetail(input);
  }

  if (typeof input === 'object') {
    return input as DetailServiceItem;
  }

  return null;
};

const safeParseDetail = (str: string): DetailServiceItem => {
  try {
    const val = JSON.parse(str);
    return val as DetailServiceItem;
  } catch {
    return null;
  }
};
