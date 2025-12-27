// Currency conversion utilities
// Note: In a real application, you would use live exchange rates from an API

const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.5,
  BRL: 5.2,
  MXN: 20.1,
  KRW: 1180,
  SGD: 1.35,
  HKD: 7.8,
  NOK: 8.5,
  SEK: 8.6,
  DKK: 6.3,
  PLN: 3.9,
  CZK: 21.5,
  HUF: 295,
  RUB: 73.5,
  TRY: 8.5,
  ZAR: 14.2,
  THB: 31.5,
  MYR: 4.1,
  IDR: 14250,
  PHP: 49.5,
  VND: 23000,
  EGP: 15.7,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.30,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  LBP: 1507,
  ILS: 3.2,
  MAD: 8.9,
  TND: 2.8,
  DZD: 134,
  LYD: 4.5,
  SDG: 55,
  ETB: 43,
  KES: 108,
  UGX: 3550,
  TZS: 2310,
  RWF: 1000,
  GHS: 6.1,
  NGN: 411,
  XOF: 558,
  XAF: 558,
  ZMW: 17.2,
  BWP: 11.1,
  SZL: 14.2,
  LSL: 14.2,
  NAD: 14.2,
  MZN: 63.9,
  AOA: 650,
  CDF: 2000,
  MGA: 3950,
  SCR: 13.4,
  MUR: 42.5,
  MVR: 15.4,
  LKR: 200,
  PKR: 170,
  BDT: 85,
  NPR: 119,
  BTN: 74.5,
  AFN: 79,
  IRR: 42000,
  IQD: 1460,
  SYP: 2512,
  YER: 250,
  AMD: 520,
  AZN: 1.7,
  GEL: 3.3,
  KZT: 425,
  KGS: 84.7,
  TJS: 11.3,
  TMT: 3.5,
  UZS: 10650,
  MNT: 2840,
  LAK: 9500,
  KHR: 4080,
  MMK: 1780,
  BND: 1.35,
  FJD: 2.1,
  PGK: 3.5,
  SBD: 8.0,
  TOP: 2.3,
  VUV: 112,
  WST: 2.6,
  XPF: 101,
  NCL: 101,
  // Add more currencies as needed
}

/**
 * Convert amount from one currency to USD
 * @param {number|string} amount - The amount to convert
 * @param {string} fromCurrency - The source currency code
 * @returns {number} - The amount in USD
 */
export const convertToUSD = (amount, fromCurrency = 'USD') => {
  if (!amount || amount === '' || amount === null || amount === undefined) return 0
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!Number.isFinite(numAmount)) return 0
  
  const currency = (fromCurrency || 'USD').toUpperCase()
  const rate = EXCHANGE_RATES[currency]
  
  if (!rate) {
    console.warn(`Exchange rate not found for currency: ${currency}`)
    return numAmount // Return original amount if rate not found
  }
  
  return numAmount / rate
}

/**
 * Convert amount from USD to another currency
 * @param {number|string} amount - The amount in USD to convert
 * @param {string} toCurrency - The target currency code
 * @returns {number} - The amount in target currency
 */
export const convertFromUSD = (amount, toCurrency = 'USD') => {
  if (!amount || amount === '' || amount === null || amount === undefined) return 0
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!Number.isFinite(numAmount)) return 0
  
  const currency = (toCurrency || 'USD').toUpperCase()
  const rate = EXCHANGE_RATES[currency]
  
  if (!rate) {
    console.warn(`Exchange rate not found for currency: ${currency}`)
    return numAmount // Return original amount if rate not found
  }
  
  return numAmount * rate
}

/**
 * Format amount as USD currency
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted USD amount
 */
export const formatUSD = (amount) => {
  if (!amount || amount === '' || amount === null || amount === undefined) return '$0'
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!Number.isFinite(numAmount)) return '$0'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}

/**
 * Convert amount to USD and format it
 * @param {number|string} amount - The amount to convert and format
 * @param {string} fromCurrency - The source currency code
 * @returns {string} - Formatted USD amount
 */
export const convertAndFormatToUSD = (amount, fromCurrency = 'USD') => {
  const usdAmount = convertToUSD(amount, fromCurrency)
  return formatUSD(usdAmount)
}

/**
 * Format amount in its original currency
 * @param {number|string} amount - The amount to format
 * @param {string} currency - The currency code
 * @returns {string} - Formatted amount in original currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount || amount === '' || amount === null || amount === undefined) return '$0'
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!Number.isFinite(numAmount)) return '$0'
  
  const currencyCode = (currency || 'USD').toUpperCase()
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount)
  } catch (error) {
    // Fallback if currency code is not supported
    return `${currencyCode} ${numAmount.toLocaleString()}`
  }
}

/**
 * Get currency symbol
 * @param {string} currency - The currency code
 * @returns {string} - Currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase()
  
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    KRW: '₩',
    RUB: '₽',
    TRY: '₺',
    BRL: 'R$',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    // Add more symbols as needed
  }
  
  return symbols[currencyCode] || currencyCode
}

export default {
  convertToUSD,
  convertFromUSD,
  formatUSD,
  convertAndFormatToUSD,
  formatCurrency,
  getCurrencySymbol,
  EXCHANGE_RATES
}