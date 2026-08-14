export type MissionProfile = "exploration" | "trade" | "combat";
export type RankCategory = "explore" | "exobiologist" | "trade" | "combat";

const STORAGE_KEY = "eec.missionProfile";

export function readMissionProfile(storage: Pick<Storage, "getItem">): MissionProfile {
  const stored = storage.getItem(STORAGE_KEY);
  return stored === "trade" || stored === "combat" ? stored : "exploration";
}

export function persistMissionProfile(storage: Pick<Storage, "setItem">, profile: MissionProfile): void {
  storage.setItem(STORAGE_KEY, profile);
}

export function rankCategoriesForProfile(profile: MissionProfile): RankCategory[] {
  if (profile === "exploration") return ["explore", "exobiologist"];
  return [profile];
}
