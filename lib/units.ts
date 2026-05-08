export type WeightUnit = 'lbs' | 'kg';

const LBS_TO_KG = 0.45359237;

const formatNumber = (value: number, fractionDigits: number) => {
  const rounded = Number(value.toFixed(fractionDigits));
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

export function displayWeight(lbs: number | null, unit: WeightUnit): string {
  if (lbs == null || !Number.isFinite(lbs)) return '—';

  if (unit === 'kg') {
    return `${formatNumber(lbs * LBS_TO_KG, 1)} kg`;
  }

  return `${formatNumber(lbs, 1)} lbs`;
}
