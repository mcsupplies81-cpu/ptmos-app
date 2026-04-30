function chain() {
  return {
    eq: async () => chain(),
  };
}

export const supabase = {
  from: (_table: string) => ({
    select: async () => ({ data: [], error: null as null | Error }),
    insert: async (_payload: unknown) => ({ error: null as null | Error }),
    upsert: async (_payload: unknown) => ({ error: null as null | Error }),
    delete: () => chain(),
  }),
};
