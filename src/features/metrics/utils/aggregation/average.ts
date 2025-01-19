export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

export const calculateWeightedAverage = (
  values: number[],
  weights: number[]
): number => {
  if (values.length !== weights.length || values.length === 0) return 0;
  
  const weightedSum = values.reduce((acc, value, index) => 
    acc + value * weights[index], 0);
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  
  return weightedSum / totalWeight;
};