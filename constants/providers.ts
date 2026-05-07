export type ProviderType = 'Clinic' | 'Med Spa' | 'Online' | 'Pharmacy';

export type DirectoryProvider = {
  id: string;
  name: string;
  type: ProviderType;
  location: string | null;
  website: string;
  description: string;
  services: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
};

// Fictional sample directory data for product testing and UI development.
// PT-OS does not endorse, verify, or recommend these providers.
export const providers: DirectoryProvider[] = [
  {
    id: 'limitless-life-clinic',
    name: 'Limitless Life Clinic',
    type: 'Clinic',
    location: 'Miami, FL',
    website: 'https://example.com/limitless-life-clinic',
    description:
      'A fictional longevity-focused clinic offering consultative peptide wellness programs, lab review, and care coordination for adults exploring supervised protocols.',
    services: ['BPC-157', 'TB-500', 'Semaglutide', 'NAD+ Support'],
    rating: 4.8,
    reviewCount: 10,
    verified: true,
  },
  {
    id: 'evergreen-peptide-clinic',
    name: 'Evergreen Peptide Clinic',
    type: 'Clinic',
    location: 'Seattle, WA',
    website: 'https://example.com/evergreen-peptide-clinic',
    description:
      'A fictional integrative clinic centered on recovery, metabolic optimization, and wellness planning with licensed-provider oversight.',
    services: ['CJC-1295', 'Ipamorelin', 'Sermorelin', 'Recovery Consults'],
    rating: 4.7,
    reviewCount: 18,
    verified: true,
  },
  {
    id: 'summit-vitality-center',
    name: 'Summit Vitality Center',
    type: 'Clinic',
    location: 'Denver, CO',
    website: 'https://example.com/summit-vitality-center',
    description:
      'A fictional physician-led wellness center providing education-forward consultations, follow-up planning, and protocol monitoring.',
    services: ['Semaglutide', 'Tirzepatide', 'BPC-157', 'Wellness Labs'],
    rating: 4.9,
    reviewCount: 14,
    verified: false,
  },
  {
    id: 'apex-wellness',
    name: 'Apex Wellness',
    type: 'Med Spa',
    location: 'Austin, TX',
    website: 'https://example.com/apex-wellness',
    description:
      'A fictional med spa offering wellness consultations, aesthetic support, and peptide education in a boutique setting.',
    services: ['NAD+', 'Glutathione', 'Sermorelin', 'Wellness Coaching'],
    rating: 4.8,
    reviewCount: 10,
    verified: true,
  },
  {
    id: 'nova-recovery-spa',
    name: 'Nova Recovery Spa',
    type: 'Med Spa',
    location: 'Scottsdale, AZ',
    website: 'https://example.com/nova-recovery-spa',
    description:
      'A fictional recovery-oriented med spa focused on post-training support, wellness check-ins, and personalized service menus.',
    services: ['BPC-157', 'TB-500', 'NAD+', 'Recovery Programs'],
    rating: 4.6,
    reviewCount: 12,
    verified: false,
  },
  {
    id: 'peptidevault',
    name: 'PeptideVault',
    type: 'Online',
    location: null,
    website: 'https://example.com/peptidevault',
    description:
      'A fictional online provider experience designed around telehealth intake, educational resources, and nationwide shipping workflows.',
    services: ['BPC-157', 'TB-500', 'CJC-1295', 'Nationwide Shipping'],
    rating: 4.8,
    reviewCount: 10,
    verified: true,
  },
  {
    id: 'northstar-telewellness',
    name: 'Northstar TeleWellness',
    type: 'Online',
    location: null,
    website: 'https://example.com/northstar-telewellness',
    description:
      'A fictional telewellness marketplace connecting members with virtual intake, follow-up education, and protocol documentation tools.',
    services: ['Semaglutide', 'Tirzepatide', 'Sermorelin', 'Telehealth Consults'],
    rating: 4.7,
    reviewCount: 16,
    verified: true,
  },
  {
    id: 'biorx-compounding',
    name: 'BioRx Compounding',
    type: 'Pharmacy',
    location: null,
    website: 'https://example.com/biorx-compounding',
    description:
      'A fictional compounding pharmacy profile included as placeholder directory data for members researching fulfillment options.',
    services: ['Compounding', 'Cold-Chain Shipping', 'Provider Coordination', 'Refill Support'],
    rating: 4.8,
    reviewCount: 10,
    verified: true,
  },
];
