import type { AnnaBioKnowledgeBase } from "../bioKnowledge.ts";

const neonAtmosphere = {
  atmosphereIncludesAny: ["neon atmosphere", "neon-rich atmosphere"],
} as const;

export const annaBacteriumKnowledgePhase2B: AnnaBioKnowledgeBase = {
  schemaVersion: 1,
  revision: "anna-bacterium-phase-2b.1",
  rules: [
    {
      id: "anna.bacterium.acies.confirmed-neon-atmosphere",
      candidate: { id: "bacterium.acies", displayName: "Bacterium Acies" },
      evidenceStatus: "confirmed-rule",
      supportingPlanetCount: 9,
      conditions: neonAtmosphere,
    },
    {
      id: "anna.bacterium.omentum.observed-nitrogen-volcanism",
      candidate: { id: "bacterium.omentum", displayName: "Bacterium Omentum" },
      evidenceStatus: "positive-observation",
      supportingPlanetCount: 3,
      conditions: { volcanismIncludesAny: ["nitrogen"] },
    },
    {
      id: "anna.bacterium.omentum.observed-ammonia-volcanism",
      candidate: { id: "bacterium.omentum", displayName: "Bacterium Omentum" },
      evidenceStatus: "positive-observation",
      supportingPlanetCount: 2,
      conditions: { volcanismIncludesAny: ["ammonia"] },
    },
    {
      id: "anna.bacterium.tela.observed-icy-neon-nitrogen",
      candidate: { id: "bacterium.tela", displayName: "Bacterium Tela" },
      evidenceStatus: "positive-observation",
      supportingPlanetCount: 2,
      conditions: {
        bodyTypes: ["Icy body"],
        ...neonAtmosphere,
        volcanismIncludesAny: ["nitrogen"],
      },
    },
  ],
};
