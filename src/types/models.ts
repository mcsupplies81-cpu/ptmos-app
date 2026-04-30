export type ResearchCategory = 'Healing' | 'Performance' | 'Longevity' | 'Other';
export type ResearchStatus = 'Early' | 'Moderate' | 'Strong' | 'Mixed';

export interface ResearchItem {
  id: string;
  name: string;
  category: ResearchCategory;
  summary: string;
  research_status: ResearchStatus;
  studied_for: string[];
}

export interface Provider {
  id: string;
  name: string;
  type: 'Telehealth' | 'Clinics' | 'Wellness';
  description: string;
  services: string[];
  is_featured: boolean;
  is_online: boolean;
  location?: string;
  rating?: number;
  outbound_url: string;
}
