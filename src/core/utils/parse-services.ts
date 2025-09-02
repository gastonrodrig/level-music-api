export type ServiceItem = { title: string; description: string };

export const parseServices = (input: any): ServiceItem[] => {
  if (input == null) return [];

  // Si viene como array con un único string JSON: ["[{...},{...}]"]
  if (Array.isArray(input)) {
    if (input.length === 1 && typeof input[0] === 'string') {
      const parsed = safeParseArray(input[0]);
      return parsed;
    }
    // Si ya es un array de objetos, devuélvelo tal cual
    return input as ServiceItem[];
  }

  // Si viene como string JSON: "[{...},{...}]"
  if (typeof input === 'string') {
    return safeParseArray(input);
  }

  // Cualquier otro caso
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