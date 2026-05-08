import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';

const RC_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS ?? '';
const RC_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID ?? '';

export const ENTITLEMENT_PRO = 'pro';

let initialized = false;

export async function initPurchases(userId?: string): Promise<void> {
  const key = Platform.OS === 'ios' ? RC_KEY_IOS : RC_KEY_ANDROID;
  if (!key) {
    console.warn('[Purchases] No RevenueCat API key configured — paywall will run in stub mode.');
    return;
  }
  if (initialized) {
    if (userId) await Purchases.logIn(userId);
    return;
  }
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey: key, appUserID: userId });
  initialized = true;
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    return await Purchases.getOfferings();
  } catch (e) {
    console.warn('[Purchases] getOfferings failed', e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.restorePurchases();
  } catch (e) {
    console.warn('[Purchases] restore failed', e);
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.warn('[Purchases] getCustomerInfo failed', e);
    return null;
  }
}

export function isPro(info: CustomerInfo | null): boolean {
  if (!info) return false;
  return info.entitlements.active[ENTITLEMENT_PRO] !== undefined;
}
