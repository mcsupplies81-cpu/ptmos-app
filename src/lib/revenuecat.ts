const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '';

export async function initRevenueCat() {
  if (!API_KEY) {
    console.warn('RevenueCat API key missing; paywall flows remain available with no-op billing init.');
    return false;
  }

  // Replace with Purchases.configure(...) in app runtime.
  return true;
}
