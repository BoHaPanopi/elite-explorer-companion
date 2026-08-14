import type { ThreatLevel } from "ogg-core";

export const OGG_TACTICAL_COMMENTS: Record<ThreatLevel, string> = {
  green: "De hom si den Foisch'n ausgsuacht.",
  yellow: "Den dad i trotzdem ned unterschätzen.",
  orange: "Jedzd werd's hoarig.",
  red: "Do pfeift da Straps.",
};

export const OGG_OPPONENT_WARNINGS = {
  severe:
    "Pilot {pilotName}. Sie haben uns gescannt. Das ist Ihre einzige und letzte Warnung.",
  standard:
    "Pilot {pilotName}. Sie haben uns gescannt. Bevor Sie irgendetwas Dummes tun, würde ich mir das noch einmal überlegen.",
} as const;
