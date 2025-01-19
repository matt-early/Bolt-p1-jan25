export const calculateCount = (values: any[]): number => {
  return values.filter(value => value !== null && value !== undefined).length;
};

export const calculateUniqueCount = (values: any[]): number => {
  return new Set(values).size;
};