export type ThreatLevel = "green" | "yellow" | "orange" | "red";

export type TacticalTarget = {
  pilotName: string;
  shipName: string;
  combatRank: string;
  legalStatus: "Clean" | "Wanted";
  bounty: number;
  missionTarget: boolean;
  wingSize: number;
  isPlayer: boolean;
};

export type OwnShip = {
  shipName: string;
  combatRank: string;
  engineered: boolean;
  shield: number;
  hull: number;
};

export type TacticalResult = {
  level: ThreatLevel;
  title: string;
  detail: string;
  oggComment: string;
  opponentWarning: string;
  recommendation: "engage" | "observe" | "withdraw";
};
