import Decimal from 'decimal.js'

/**
 * Mathematical and financial constants used across the kalkul-maths library
 */

// Time-related constants
export const DAYS_PER_YEAR = 365.25
export const DAYS_PER_WEEK = 7
export const MONTHS_PER_YEAR = 12

// Percentage calculations
export const PERCENTAGE_DIVISOR = 100

// Decimal.js constants for common values
export const DECIMAL_0 = new Decimal(0)
export const DECIMAL_1 = new Decimal(1)

// Fee calculation constants
export const FORTY_SIXTY_FEE_RATIO = 0.6
