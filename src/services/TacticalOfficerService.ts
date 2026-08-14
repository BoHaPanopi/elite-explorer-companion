import type {
  OwnShip,
  TacticalResult,
  TacticalTarget,
  ThreatLevel,
} from "ogg-core";
import { createTonyTacticalText, type TonyProfile } from "ogg-core";
import {
  OGG_OPPONENT_WARNINGS,
  OGG_TACTICAL_COMMENTS,
} from "../content/tacticalOfficer";

const rankScore: Record<string, number> = {
  Harmless: 0,
  "Mostly Harmless": 1,
  Novice: 2,
  Competent: 3,
  Expert: 4,
  Master: 5,
  Dangerous: 6,
  Deadly: 7,
  Elite: 8,
  "Elite I": 9,
  "Elite II": 10,
  "Elite III": 11,
  "Elite IV": 12,
  "Elite V": 13,
};

const shipScore: Record<string, number> = {
  Sidewinder: 1,
  Eagle: 1,
  Viper: 2,
  Cobra: 2,
  Vulture: 3,
  Python: 4,
  "Krait MkII": 4,
  Mamba: 5,
  "Fer-de-Lance": 5,
  Anaconda: 6,
  "Imperial Cutter": 7,
  "Federal Corvette": 8,
};

function getRankScore(rank: string): number {
  return rankScore[rank] ?? 4;
}

function getShipScore(ship: string): number {
  const exact = shipScore[ship];
  if (exact !== undefined) return exact;

  const found = Object.entries(shipScore).find(([name]) =>
    ship.toLowerCase().includes(name.toLowerCase()),
  );

  return found?.[1] ?? 3;
}

function ownStrength(own: OwnShip): number {
  return (
    getShipScore(own.shipName) * 2 +
    getRankScore(own.combatRank) +
    (own.engineered ? 3 : 0) +
    own.shield / 50 +
    own.hull / 50
  );
}

function targetStrength(target: TacticalTarget): number {
  return (
    getShipScore(target.shipName) * 2 +
    getRankScore(target.combatRank) +
    Math.max(0, target.wingSize - 1) * 2.25 +
    (target.isPlayer ? 2 : 0)
  );
}

function getThreatLevel(
  own: OwnShip,
  target: TacticalTarget,
): ThreatLevel {
  const difference = targetStrength(target) - ownStrength(own);

  if (own.shield < 20 || own.hull < 25 || difference > 7) {
    return "red";
  }

  if (difference > 2) return "orange";
  if (difference > -4) return "yellow";
  return "green";
}

function getOggComment(level: ThreatLevel): string {
  return OGG_TACTICAL_COMMENTS[level];
}

export function assessTarget(
  own: OwnShip,
  target: TacticalTarget,
  tonyProfile: TonyProfile | null = null,
): TacticalResult {
  const level = getThreatLevel(own, target);
  const tonyText = tonyProfile ? createTonyTacticalText(target, level) : null;

  const title = target.missionTarget
    ? `Missionsziel: ${target.pilotName}`
    : target.legalStatus === "Wanted"
      ? `Gesuchter Pilot: ${target.pilotName}`
      : `Scan durch ${target.pilotName}`;

  const missionText = target.missionTarget
    ? "Missionsziel"
    : target.legalStatus === "Wanted"
      ? "Gesucht, kein Missionsziel"
      : "Sauber";

  const wingText =
    target.wingSize > 1
      ? ` · Wing mit ${target.wingSize} Schiffen`
      : "";

  const bountyText =
    target.bounty > 0
      ? ` · Erwartetes Kopfgeld ${target.bounty.toLocaleString("de-DE")} Cr`
      : "";

  const recommendation =
    level === "red"
      ? "withdraw"
      : level === "orange"
        ? "observe"
        : "engage";

  const opponentWarning =
    (level === "red" || level === "orange"
      ? OGG_OPPONENT_WARNINGS.severe
      : OGG_OPPONENT_WARNINGS.standard
    ).replace("{pilotName}", target.pilotName);

  return {
    level,
    title: tonyText?.title ?? title,
    detail: tonyText?.detail ?? `${missionText} · ${target.shipName} · ${target.combatRank}${wingText}${bountyText}`,
    oggComment: tonyText?.oggComment ?? getOggComment(level),
    opponentWarning: tonyText?.opponentWarning ?? opponentWarning,
    recommendation,
  };
}

export function createDefaultOwnShip(): OwnShip {
  return {
    shipName: "Federal Corvette",
    combatRank: "Elite",
    engineered: true,
    shield: 100,
    hull: 100,
  };
}
