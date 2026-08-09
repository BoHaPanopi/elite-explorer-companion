import { useMemo, useState } from "react";

type CrewPageProps = {
  bordcomputerName: string;
  commanderName: string;
  onRename: () => void;
  onTestGreeting: () => void;
  onPlayIntroduction: () => void;
};

type CrewRole = "science" | "navigation" | "engineering";

type CrewMember = {
  role: CrewRole;
  defaultName: string;
  title: string;
  region: string;
  initials: string;
  icon: string;
  description: string;
};

const STORAGE_PREFIX = "ogg.crew.";

const crewMembers: CrewMember[] = [
  {
    role: "science",
    defaultName: "Johanna",
    title: "Wissenschaftsoffizierin",
    region: "Deutschland · klares Hochdeutsch",
    initials: "JO",
    icon: "🔬",
    description:
      "Exploration, Exobiologie, FSS, DSS und wissenschaftliche Auswertung.",
  },
  {
    role: "navigation",
    defaultName: "Konrad",
    title: "Navigationsoffizier",
    region: "Hannover · ruhiges Hochdeutsch",
    initials: "KO",
    icon: "🧭",
    description:
      "Routen, Treibstoffreserven, Sprungoptimierung und Wegpunkte.",
  },
  {
    role: "engineering",
    defaultName: "Eva Maria",
    title: "Technische Offizierin",
    region: "Mecklenburg-Vorpommern · norddeutsch ruhig",
    initials: "EM",
    icon: "⚙️",
    description:
      "Energie, Module, Reparaturen, Schilde und Schiffszustand.",
  },
];

function readSavedName(member: CrewMember): string {
  const saved = localStorage.getItem(`${STORAGE_PREFIX}${member.role}.name`);
  return saved?.trim() || member.defaultName;
}

export default function CrewPage({
  bordcomputerName,
  commanderName,
  onRename,
  onTestGreeting,
  onPlayIntroduction,
}: CrewPageProps) {
  const initialNames = useMemo(
    () =>
      Object.fromEntries(
        crewMembers.map((member) => [member.role, readSavedName(member)]),
      ) as Record<CrewRole, string>,
    [],
  );

  const [names, setNames] = useState<Record<CrewRole, string>>(initialNames);
  const [editingRole, setEditingRole] = useState<CrewRole | null>(null);
  const [draftName, setDraftName] = useState("");

  function startEditing(member: CrewMember) {
    setEditingRole(member.role);
    setDraftName(names[member.role]);
  }

  function cancelEditing() {
    setEditingRole(null);
    setDraftName("");
  }

  function saveName(member: CrewMember) {
    const nextName = draftName.trim();
    if (!nextName) return;

    localStorage.setItem(`${STORAGE_PREFIX}${member.role}.name`, nextName);
    setNames((current) => ({
      ...current,
      [member.role]: nextName,
    }));
    cancelEditing();
  }

  return (
    <section className="crew-deck">
      <header className="crew-deck__header">
        <div>
          <span className="crew-deck__eyebrow">
            DEUTSCHE STAMMBESATZUNG
          </span>
          <h2>Ihre Crew im Cockpit</h2>
          <p>
            Vier Rollen, klare Zuständigkeiten und frei wählbare Namen.
          </p>
        </div>

        <div className="crew-deck__count">
          <strong>4</strong>
          <span>Crewmitglieder</span>
        </div>
      </header>

      <article className="crew-hero">
        <div className="crew-hero__portrait-wrap">
          <div className="crew-hero__portrait" aria-hidden="true" />
          <span className="crew-hero__online">
            <i aria-hidden="true" />
            ONLINE
          </span>
        </div>

        <div className="crew-hero__content">
          <div className="crew-hero__topline">
            <div>
              <span className="crew-hero__role">
                BORDCOMPUTER · ERSTER OFFIZIER
              </span>
              <h2>{bordcomputerName}</h2>
              <p className="crew-hero__subtitle">
                Old Guy of Grumpy · Bayern
              </p>
            </div>

            <span className="crew-hero__badge">OGG</span>
          </div>

          <p className="crew-hero__description">
            Ein alter Hase mit leichtem Grant, trockenem Humor und
            einem großen Herzen für seinen Commander.
          </p>

          <blockquote>
            „Old Guy of Grumpy ist der Typ, der über alles ein bisschen
            schimpft – außer über seinen Commander.“
          </blockquote>

          <div className="crew-hero__tags">
            <span>Deutsch</span>
            <span>Leicht bayerisch</span>
            <span>Trocken-humorig</span>
            <span>Spricht wenig</span>
          </div>

          <div className="crew-hero__actions">
            <button
              className="crew-action crew-action--primary"
              type="button"
              onClick={onPlayIntroduction}
            >
              ▶ Vorstellung anhören
            </button>

            <button
              className="crew-action"
              type="button"
              onClick={onTestGreeting}
            >
              Begrüßung testen
            </button>

            <button
              className="crew-action crew-action--quiet"
              type="button"
              onClick={onRename}
            >
              Namen ändern
            </button>
          </div>

          <footer className="crew-hero__footer">
            <span>Zugeordnet zu Commander {commanderName}</span>
            <span>Deutsche Originalbesatzung</span>
          </footer>
        </div>
      </article>

      <section className="crew-roster">
        <div className="crew-roster__heading">
          <div>
            <span>CREW</span>
            <h3>Fachoffiziere</h3>
          </div>

          <p>
            Namen können jederzeit geändert werden.
          </p>
        </div>

        <div className="crew-roster__grid">
          {crewMembers.map((member) => {
            const isEditing = editingRole === member.role;

            return (
              <article
                className={`crew-member crew-member--${member.role}`}
                key={member.role}
              >
                <div className="crew-member__avatar" aria-hidden="true">
                  <span className="crew-member__icon">{member.icon}</span>
                  <strong>{member.initials}</strong>
                </div>

                <div className="crew-member__body">
                  <div className="crew-member__topline">
                    <div>
                      {isEditing ? (
                        <input
                          className="crew-member__name-input"
                          value={draftName}
                          maxLength={28}
                          autoFocus
                          onChange={(event) =>
                            setDraftName(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              saveName(member);
                            }

                            if (event.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                        />
                      ) : (
                        <h3>{names[member.role]}</h3>
                      )}

                      <span>{member.title}</span>
                    </div>

                    <span className="crew-member__ready">
                      <i aria-hidden="true" />
                      BEREIT
                    </span>
                  </div>

                  <p>{member.description}</p>

                  <div className="crew-member__region">
                    {member.region}
                  </div>

                  <footer>
                    {isEditing ? (
                      <div className="crew-member__edit-actions">
                        <button
                          className="crew-action crew-action--small crew-action--primary"
                          type="button"
                          onClick={() => saveName(member)}
                          disabled={!draftName.trim()}
                        >
                          Speichern
                        </button>

                        <button
                          className="crew-action crew-action--small"
                          type="button"
                          onClick={cancelEditing}
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        className="crew-action crew-action--small"
                        type="button"
                        onClick={() => startEditing(member)}
                      >
                        Namen ändern
                      </button>
                    )}
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
