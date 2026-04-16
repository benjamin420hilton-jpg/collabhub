/**
 * Platform fee rates in basis points.
 * 1000 basis points = 10%
 * 0 basis points = 0%
 *
 * All monetary values throughout the app are stored and computed
 * as integers in the smallest currency unit (cents for AUD).
 */
export const PLATFORM_FEE_RATES = {
  free: 1000, // 10%
  pro: 0, // 0%
} as const;

export const DEFAULT_CURRENCY = "aud" as const;

export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    features: [
      "Post public campaigns",
      "Pay-as-you-go with 10% platform fee",
    ],
  },
  pro: {
    name: "Pro",
    features: [
      "Access Influencer Discovery Directory",
      "Send direct offers to influencers",
      "0% platform transaction fees",
      "Create product gifting campaigns",
    ],
  },
} as const;

/**
 * Convert cents to display dollars (AUD).
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert display dollars to cents for storage.
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Calculate the platform fee for a given amount and tier.
 * @param amountCents - Total amount in cents
 * @param feeRateBasisPoints - Fee rate in basis points
 * @returns Fee amount in cents
 */
export function calculatePlatformFee(
  amountCents: number,
  feeRateBasisPoints: number,
): number {
  return Math.round((amountCents * feeRateBasisPoints) / 10000);
}
