/**
 * Formats size, showing only one value if min and max are the same or one is 0
 * @param minSize - Minimum size
 * @param maxSize - Maximum size
 * @param unit - Size unit (e.g., "sqft", "sqm")
 * @returns Formatted size string
 */
export function formatSize(
  minSize: number | undefined | null,
  maxSize: number | undefined | null,
  unit: string | undefined | null
): string {
  // Convert to numbers and handle NaN, undefined, null
  const min = Number(minSize) || 0;
  const max = Number(maxSize) || 0;
  const sizeUnit = unit || '';

  // Check for NaN
  if (isNaN(min) || isNaN(max)) {
    return '';
  }

  // If both are 0, return 0
  if (min === 0 && max === 0) {
    return sizeUnit ? `0 ${sizeUnit}` : '0';
  }

  // If they're the same, show only one value
  if (min === max) {
    return sizeUnit ? `${min} ${sizeUnit}` : `${min}`;
  }

  // If one is 0, show only the non-zero value
  if (min === 0) {
    return sizeUnit ? `${max} ${sizeUnit}` : `${max}`;
  }
  if (max === 0) {
    return sizeUnit ? `${min} ${sizeUnit}` : `${min}`;
  }

  // Otherwise, show range
  return sizeUnit ? `${min}-${max} ${sizeUnit}` : `${min}-${max}`;
}

