import { COMMAND_CENTER_COPY, MISSION_PROFILE_LABELS, RANK_CATEGORY_LABELS } from "../content/commandCenter";
import { careerRankName } from "../features/explorationRank";
import { resolveRankAsset, resolveShipAsset, type FrontierAsset } from "../features/frontierAssets";
import { rankCategoriesForProfile, type MissionProfile, type RankCategory } from "../features/missionProfile";
import { useI18n } from "../i18n";

export type DashboardJourney = { startSystem: string; destinationSystem: string; startedAt: string; arrivedAt: string; durationSeconds: number };

type DashboardProps = {
  commander: string;
  ranks: Record<RankCategory, { level: number; progress: number | null } | null>;
  activeProfile: MissionProfile;
  ship: string | null;
  shipName: string | null;
  shipIdent: string | null;
  journey: DashboardJourney | null;
  system: string;
  systemLabel: string;
  status: string;
  statusLabel: string;
  statusTone: "flight" | "docked" | "landed" | "idle";
  profileMeta: string | null;
  contextLabel: string | null;
  contextValue: string | null;
};

function OptionalFrontierAsset({ asset, fallback, className = "" }: { asset: FrontierAsset | null; fallback: string; className?: string }) {
  return asset ? <img className={`command-card__asset ${className}`} src={asset.src} alt={asset.alt} /> : <span className={`command-card__asset-fallback ${className}`} aria-hidden="true">{fallback}</span>;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours ? `${hours} h` : null, minutes ? `${minutes} min` : null, `${remainingSeconds} s`].filter(Boolean).join(" ");
}

function RankDisplay({ category, rank, language }: { category: RankCategory; rank: { level: number; progress: number | null } | null; language: Parameters<typeof careerRankName>[2] }) {
  const copy = COMMAND_CENTER_COPY[language];
  const label = RANK_CATEGORY_LABELS[language][category];
  const name = careerRankName(category, rank?.level, language);
  return <section className="commander-rank"><OptionalFrontierAsset asset={resolveRankAsset(category, rank?.level)} fallback={category === "exobiologist" ? "EXO" : category.slice(0, 3).toUpperCase()} /><div><span>{label}</span><strong>{name ?? copy.unknown}</strong>{rank?.progress != null ? <small>{rank.progress} %</small> : null}{rank?.progress != null ? <progress max="100" value={rank.progress} aria-label={`${label}: ${rank.progress} %`} /> : null}</div></section>;
}

export default function Dashboard(props: DashboardProps) {
  const { language, t } = useI18n();
  const copy = COMMAND_CENTER_COPY[language];
  const rankCategories = rankCategoriesForProfile(props.activeProfile);
  return <section className="dashboard-overview" aria-labelledby="command-center-title">
    <header className="dashboard-hero"><div className="command-identity"><span className="dashboard-kicker">CMDR</span><h2 id="command-center-title">{props.commander}</h2><div className="command-system"><span>{props.systemLabel}</span><strong>{props.system}</strong></div></div>
      <div className="command-center-status"><div className="command-center-status__item"><span>{t("activeProfile")}</span><strong>{MISSION_PROFILE_LABELS[language][props.activeProfile]}</strong>{props.profileMeta ? <small className="command-center-status__meta">{props.profileMeta}</small> : null}</div><div className="command-center-status__item"><span>{props.statusLabel}</span><div className={`dashboard-flight-state dashboard-flight-state--${props.statusTone}`}><i aria-hidden="true" /><strong>{props.status}</strong></div>{props.contextLabel && props.contextValue ? <div className="command-center-status__detail"><span>{props.contextLabel}</span><strong>{props.contextValue}</strong></div> : null}</div></div>
    </header>
    <div className="command-card-grid">
      <article className={`panel command-card command-card--commander command-card--profile-${props.activeProfile}`}><header><div><span className="dashboard-kicker">{copy.commander}</span><h3>{props.commander}</h3></div></header><div className={`commander-ranks${rankCategories.length === 2 ? " commander-ranks--dual" : ""}`}>{rankCategories.map((category) => <RankDisplay category={category} rank={props.ranks[category]} language={language} key={category} />)}</div></article>
      <article className="panel command-card command-card--journey"><header><div><span className="dashboard-kicker">{copy.navigationOfficer}</span><h3>{copy.lastJourney}</h3></div></header>{props.journey ? <dl><div><dt>{copy.start}</dt><dd>{props.journey.startSystem}</dd></div><div><dt>{copy.destination}</dt><dd>{props.journey.destinationSystem}</dd></div><div><dt>{copy.startedAt}</dt><dd>{new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(props.journey.startedAt))}</dd></div><div><dt>{copy.duration}</dt><dd>{formatDuration(props.journey.durationSeconds)}</dd></div></dl> : <p className="muted">{copy.unavailable}</p>}</article>
      <article className="panel command-card command-card--ship"><header><span className="dashboard-kicker">{copy.currentShip}</span></header><div className="command-card__ship-layout"><OptionalFrontierAsset asset={resolveShipAsset(props.ship)} fallback="SHIP" className="command-card__ship-asset" /><dl className="command-card__ship-details"><div><dt>{copy.shipType}</dt><dd>{props.ship ?? copy.unknown}</dd></div><div><dt>{copy.shipName}</dt><dd>{props.shipName ?? copy.unknown}</dd></div><div><dt>{copy.shipIdent}</dt><dd>{props.shipIdent ?? copy.unknown}</dd></div></dl></div></article>
    </div>
  </section>;
}
