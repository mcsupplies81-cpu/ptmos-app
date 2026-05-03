import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export const RC_API_KEY =
  Platform.select({
    ios: 'test_UhfwKDqgnMZjDbCwmCpnmZrgcWT',
    android: 'test_UhfwKDqgnMZjDbCwmCpnmZrgcWT',
  }) ?? 'test_UhfwKDqgnMZjDbCwmCpnmZrgcWT';

export function initRevenueCat(userId?: string): void {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: RC_API_KEY });
  if (userId) {
    void Purchases.logIn(userId);
  }
}

export async function checkProEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active['PT-OS Pro'] !== 'undefined';
  } catch {
    return false;
  }
}
