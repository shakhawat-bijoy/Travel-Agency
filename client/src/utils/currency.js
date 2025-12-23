// Currency conversion + formatting utilities
// NOTE: Rates here are approximate static values.
// For production, fetch live rates from a trusted FX API.
// This app displays all prices in USD.
const BDT_PER_CURRENCY = {
  // 1 <CURRENCY> ≈ X BDT
  USD: 122.0,
  EUR: 132.0,
  GBP: 155.0,
  CAD: 90.0,
  AUD: 80.0,
  INR: 1.45,
  THB: 3.40, // Amadeus often returns hotel prices in THB
  BDT: 1.0,
}

const USD_BDT_RATE = BDT_PER_CURRENCY.USD

/**
 * Convert any supported currency to USD.
 * @param {number|string} amount - The amount to convert
 * @param {string} fromCurrency - The source currency code (USD, EUR, etc.)
 * @returns {number} - The amount in USD
 */
export const convertToUSD = (amount, fromCurrency = 'USD') => {
  const numAmount = parseFloat(amount)
  if (!Number.isFinite(numAmount)) return 0

  const key = String(fromCurrency || 'USD').trim().toUpperCase()
  const bdtPerUnit = BDT_PER_CURRENCY[key]

  // If currency is missing/unknown, safest UX default for this app is to treat it as USD.
  // That keeps values stable when APIs omit currency codes.
  if (bdtPerUnit == null) return numAmount

  const amountBDT = numAmount * bdtPerUnit
  return USD_BDT_RATE ? amountBDT / USD_BDT_RATE : numAmount
}

/**
 * Format a USD amount.
 * @param {number|string} amount - The amount in USD
 * @param {boolean} showCurrency - Whether to show the $ symbol
 * @returns {string} - Formatted USD amount
 */
export const formatUSD = (amount, showCurrency = true) => {
  const numAmount = parseFloat(amount)
  const safeAmount = Number.isFinite(numAmount) ? numAmount : 0

  if (showCurrency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount)
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount)
}

/**
 * Convert and format any supported currency to USD.
 * @param {number|string} amount - The amount to convert
 * @param {string} fromCurrency - The source currency code
 * @param {boolean} showCurrency - Whether to show the $ symbol
 * @returns {string} - Formatted USD amount
 */
export const convertAndFormatToUSD = (amount, fromCurrency = 'USD', showCurrency = true) => {
  const usdAmount = convertToUSD(amount, fromCurrency)
  return formatUSD(usdAmount, showCurrency)
}

/**
 * Get a currency's approximate USD conversion factor.
 * @param {string} currency - Currency code
 * @returns {number} - Approximate value of 1 unit of `currency` in USD
 */
export const getExchangeRateToUSD = (currency) => {
  const key = String(currency || 'USD').trim().toUpperCase()
  const bdtPerUnit = BDT_PER_CURRENCY[key]
  if (bdtPerUnit == null || !USD_BDT_RATE) return 1
  return bdtPerUnit / USD_BDT_RATE
}

// Backwards-compatible exports (older code still imports these names).
// They now return USD values.
export const convertToBDT = convertToUSD
export const formatBDT = formatUSD
export const convertAndFormatToBDT = convertAndFormatToUSD
export const getExchangeRate = getExchangeRateToUSD