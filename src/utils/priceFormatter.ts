/**
 * Formats price in lakhs, converting to crores if >= 100 lakhs
 * @param minPrice - Minimum price in lakhs
 * @param maxPrice - Maximum price in lakhs
 * @param includeRupeeSymbol - Whether to include ₹ symbol (default: false)
 * @returns Formatted price string
 */
export function formatPrice(
  minPrice: number | undefined | null,
  maxPrice: number | undefined | null,
  includeRupeeSymbol: boolean = false
): string {
  const symbol = includeRupeeSymbol ? '₹' : '';

  // Convert to numbers and handle NaN, undefined, null
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || 0;

  // Check for NaN
  if (isNaN(min) || isNaN(max)) {
    return '';
  }

  // If both are 0, return 0
  if (min === 0 && max === 0) {
    return `${symbol}0`;
  }

  // If they're the same, show only one value
  if (min === max) {
    const useCrores = min >= 100;
    if (useCrores) {
      const priceCr = (min / 100).toFixed(2).replace(/\.?0+$/, '');
      return `${symbol}${priceCr} Cr`;
    } else {
      return `${symbol}${min} Lakh`;
    }
  }

  // If one is 0, show only the non-zero value
  if (min === 0) {
    const useCrores = max >= 100;
    if (useCrores) {
      const priceCr = (max / 100).toFixed(2).replace(/\.?0+$/, '');
      return `${symbol}${priceCr} Cr`;
    } else {
      return `${symbol}${max} Lakh`;
    }
  }
  if (max === 0) {
    const useCrores = min >= 100;
    if (useCrores) {
      const priceCr = (min / 100).toFixed(2).replace(/\.?0+$/, '');
      return `${symbol}${priceCr} Cr`;
    } else {
      return `${symbol}${min} Lakh`;
    }
  }

  // Otherwise, show range
  const useCrores = min >= 100;
  if (useCrores) {
    const minCr = (min / 100).toFixed(2).replace(/\.?0+$/, '');
    const maxCr = (max / 100).toFixed(2).replace(/\.?0+$/, '');
    return `${symbol}${minCr}-${maxCr} Cr`;
  } else {
    return `${symbol}${min}-${max} Lakh`;
  }
}

/**
 * Formats price for display in text/copy operations (includes "Lakhs" or "Crores" label)
 * @param minPrice - Minimum price in lakhs
 * @param maxPrice - Maximum price in lakhs
 * @returns Formatted price string with unit label
 */
export function formatPriceWithLabel(
  minPrice: number | undefined | null,
  maxPrice: number | undefined | null
): string {
  // Convert to numbers and handle NaN, undefined, null
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || 0;

  // Check for NaN
  if (isNaN(min) || isNaN(max)) {
    return '';
  }

  // If both are 0, return 0
  if (min === 0 && max === 0) {
    return '₹0';
  }

  // If they're the same, show only one value
  if (min === max) {
    const useCrores = min >= 100;
    if (useCrores) {
      const priceCr = (min / 100).toFixed(2).replace(/\.?0+$/, '');
      return `₹${priceCr} Crores`;
    } else {
      return `₹${min} Lakhs`;
    }
  }

  // If one is 0, show only the non-zero value
  if (min === 0) {
    const useCrores = max >= 100;
    if (useCrores) {
      const priceCr = (max / 100).toFixed(2).replace(/\.?0+$/, '');
      return `₹${priceCr} Crores`;
    } else {
      return `₹${max} Lakhs`;
    }
  }
  if (max === 0) {
    const useCrores = min >= 100;
    if (useCrores) {
      const priceCr = (min / 100).toFixed(2).replace(/\.?0+$/, '');
      return `₹${priceCr} Crores`;
    } else {
      return `₹${min} Lakhs`;
    }
  }

  // Otherwise, show range
  const useCrores = min >= 100;
  if (useCrores) {
    const minCr = (min / 100).toFixed(2).replace(/\.?0+$/, '');
    const maxCr = (max / 100).toFixed(2).replace(/\.?0+$/, '');
    return `₹${minCr}-${maxCr} Crores`;
  } else {
    return `₹${min}-${max} Lakhs`;
  }
}

