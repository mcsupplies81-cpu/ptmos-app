import { Copy } from '../constants/copy';

export const RESEARCH_TABS = ['All', 'Healing', 'Performance', 'Longevity', 'Other'] as const;

export function researchCardCopy(name: string, category: string, summary: string) {
  return { name, categoryBadge: category, summary };
}

export function researchDetailCopy() {
  return {
    labels: {
      researchStatus: 'research status',
      studiedFor: 'studied for',
      educationalOverview: 'educational overview',
      save: 'Save',
      notes: 'Your notes',
      savedOnly: 'Saved items',
    },
    disclaimer: Copy.researchDisclaimer,
  };
}
