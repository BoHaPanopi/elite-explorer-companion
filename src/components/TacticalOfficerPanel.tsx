import { useMemo, useState } from "react";
import { speechService } from "../services/SpeechService";
import {
  assessTarget,
  createDefaultOwnShip,
} from "../services/TacticalOfficerService";
import { tacticalAlarmService } from "../services/TacticalAlarmService";
import type {
  TacticalResult,
  TacticalTarget,
} from "ogg-core";

const demoTargets: TacticalTarget[] = [
  {
    pilotName: "Dread Pirate Roberts",
    shipName: "Viper",
    combatRank: "Competent",
    legalStatus: "Wanted",
    bounty: 82500,
    missionTarget: true,
    wingSize: 1,
    isPlayer: false,
  },
  {
    pilotName: "Black Jack Mason",
    shipName: "Anaconda",
    combatRank: "Elite",
    legalStatus: "Wanted",
    bounty: 2300000,
    missionTarget: false,
    wingSize: 4,
    isPlayer: false,
  },
  {
    pilotName: "CMDR Night Raven",
    shipName: "Federal Corvette",
    combatRank: "Elite V",
    legalStatus: "Wanted",
    bounty: 8400000,
    missionTarget: false,
    wingSize: 3,
    isPlayer: true,
  },
];

export default function TacticalOfficerPanel() {
  const ownShip = useMemo(() => createDefaultOwnShip(), []);
  const [targetIndex, setTargetIndex] = useState(0);
  const [result, setResult] =
    useState<TacticalResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const target = demoTargets[targetIndex];

  async function simulateScan() {
    const assessment = assessTarget(ownShip, target);
    setResult(assessment);
    setIsRunning(true);

    try {
      await tacticalAlarmService.play();
      await new Promise((resolve) =>
        window.setTimeout(resolve, 1150),
      );

      await speechService.speakSequence(
        [
          assessment.opponentWarning,
          `Käpt'n. ${assessment.detail}. ${assessment.oggComment}`,
        ],
        500,
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="tactical-officer panel">
      <header className="tactical-officer__header">
        <div>
          <span>ALPHA 0.13.0</span>
          <h2>Taktischer Offizier</h2>
          <p>
            Demo für Alarm, Gegneransprache,
            Missionsziel und Kopfgeld.
          </p>
        </div>

        <div className="tactical-officer__own">
          <strong>{ownShip.shipName}</strong>
          <span>
            {ownShip.combatRank} ·{" "}
            {ownShip.engineered
              ? "voll engineered"
              : "Standardausbau"}
          </span>
        </div>
      </header>

      <div className="tactical-officer__controls">
        <label>
          Testziel
          <select
            value={targetIndex}
            onChange={(event) => {
              setTargetIndex(Number(event.target.value));
              setResult(null);
            }}
          >
            {demoTargets.map((entry, index) => (
              <option key={entry.pilotName} value={index}>
                {entry.pilotName} · {entry.shipName}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={isRunning}
          onClick={() => void simulateScan()}
        >
          {isRunning ? "Warnung läuft …" : "Scan simulieren"}
        </button>
      </div>

      <div className="tactical-target">
        <div>
          <span>PILOT</span>
          <strong>{target.pilotName}</strong>
        </div>
        <div>
          <span>SCHIFF</span>
          <strong>{target.shipName}</strong>
        </div>
        <div>
          <span>RANG</span>
          <strong>{target.combatRank}</strong>
        </div>
        <div>
          <span>STATUS</span>
          <strong>
            {target.missionTarget
              ? "Missionsziel"
              : target.legalStatus}
          </strong>
        </div>
        <div>
          <span>KOPFGELD</span>
          <strong>
            {target.bounty.toLocaleString("de-DE")} Cr
          </strong>
        </div>
        <div>
          <span>WING</span>
          <strong>{target.wingSize}</strong>
        </div>
      </div>

      {result && (
        <article
          className={`tactical-result tactical-result--${result.level}`}
        >
          <div className="tactical-result__lamp" />

          <div>
            <span>OGG-LAGEBEURTEILUNG</span>
            <h3>{result.title}</h3>
            <p>{result.detail}</p>
            <blockquote>
              „{result.opponentWarning}“
            </blockquote>
            <strong>{result.oggComment}</strong>
          </div>
        </article>
      )}
    </section>
  );
}
