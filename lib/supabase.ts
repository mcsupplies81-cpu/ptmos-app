export const supabase = {
  from: (_table: string) => ({
    insert: async (_payload: unknown) => ({ error: null }),
    update: async (_payload: unknown) => ({ eq: async (_col: string, _value: string) => ({ error: null }) }),
  }),
};
