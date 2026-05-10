import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { WeightUnit } from "@/lib/units";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  disclaimer_accepted: boolean;
  disclaimer_accepted_at: string | null;
  date_of_birth: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  weight_unit: WeightUnit;
  goal: string | null;
  goals: string[] | null;
  experience: string | null;
  onboarding_complete: boolean | null;
};

type UpsertProfilePayload = Partial<Omit<Profile, "id">>;

type ProfileState = {
  profile: Profile | null | undefined; // undefined = not yet fetched
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  upsertProfile: (
    userId: string,
    values: UpsertProfilePayload,
  ) => Promise<void>;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: undefined, // undefined means "not fetched yet"
  loading: false,
  setProfile: (profile) => set({ profile }),
  fetchProfile: async (userId) => {
    set({ loading: true });
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, disclaimer_accepted, disclaimer_accepted_at, date_of_birth, height_inches, weight_lbs, weight_unit, goal, goals, experience, onboarding_complete",
      )
      .eq("id", userId)
      .maybeSingle();
    set({ profile: (data as Profile | null) ?? null, loading: false });
  },
  upsertProfile: async (userId, values) => {
    await supabase.from("profiles").upsert({ id: userId, ...values });
    await get().fetchProfile(userId);
  },
}));
