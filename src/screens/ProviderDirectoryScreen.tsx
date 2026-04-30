export const PROVIDER_TABS = ['All', 'Telehealth', 'Clinics', 'Wellness'] as const;

export function providerCardCopy(params: {
  name: string;
  type: string;
  is_online: boolean;
  location?: string;
  rating?: number;
}) {
  return {
    name: params.name,
    typeBadge: params.type,
    indicator: params.is_online ? 'Online' : params.location ?? 'Location available',
    rating: params.rating,
  };
}

export function providerDetailCopy() {
  return {
    cta: 'Visit Website',
  };
}
