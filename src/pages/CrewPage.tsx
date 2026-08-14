import { useMemo, useState } from "react";
import { CREW_PAGE_COPY, CREW_PAGE_MEMBERS } from "../content/crewPage";

type CrewPageProps = {
  bordcomputerName: string;
  commanderName: string;
  onRename: () => void;
  onTestGreeting: () => void;
  onPlayIntroduction: () => void;
};

type CrewMember = (typeof CREW_PAGE_MEMBERS)[number];
type CrewRole = CrewMember["role"];

const STORAGE_PREFIX = "ogg.crew.";

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
        CREW_PAGE_MEMBERS.map((member) => [member.role, readSavedName(member)]),
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
            {CREW_PAGE_COPY.eyebrow}
          </span>
          <h2>{CREW_PAGE_COPY.heading}</h2>
          <p>{CREW_PAGE_COPY.introduction}</p>
        </div>

        <div className="crew-deck__count">
          <strong>4</strong>
          <span>{CREW_PAGE_COPY.memberCount}</span>
        </div>
      </header>

      <article className="crew-hero">
        <div className="crew-hero__portrait-wrap">
          <div className="crew-hero__portrait" aria-hidden="true" />
          <span className="crew-hero__online">
            <i aria-hidden="true" />
            {CREW_PAGE_COPY.online}
          </span>
        </div>

        <div className="crew-hero__content">
          <div className="crew-hero__topline">
            <div>
              <span className="crew-hero__role">
                {CREW_PAGE_COPY.oggRole}
              </span>
              <h2>{bordcomputerName}</h2>
              <p className="crew-hero__subtitle">
                {CREW_PAGE_COPY.oggSubtitle}
              </p>
            </div>

            <span className="crew-hero__badge">{CREW_PAGE_COPY.oggBadge}</span>
          </div>

          <p className="crew-hero__description">
            {CREW_PAGE_COPY.oggDescription}
          </p>

          <blockquote>
            {CREW_PAGE_COPY.oggQuote}
          </blockquote>

          <div className="crew-hero__tags">
            {CREW_PAGE_COPY.oggTags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <div className="crew-hero__actions">
            <button
              className="crew-action crew-action--primary"
              type="button"
              onClick={onPlayIntroduction}
            >
              {CREW_PAGE_COPY.playIntroduction}
            </button>

            <button
              className="crew-action"
              type="button"
              onClick={onTestGreeting}
            >
              {CREW_PAGE_COPY.testGreeting}
            </button>

            <button
              className="crew-action crew-action--quiet"
              type="button"
              onClick={onRename}
            >
              {CREW_PAGE_COPY.rename}
            </button>
          </div>

          <footer className="crew-hero__footer">
            <span>{CREW_PAGE_COPY.assignedToCommander} {commanderName}</span>
            <span>{CREW_PAGE_COPY.originalCrew}</span>
          </footer>
        </div>
      </article>

      <section className="crew-roster">
        <div className="crew-roster__heading">
          <div>
            <span>{CREW_PAGE_COPY.rosterEyebrow}</span>
            <h3>{CREW_PAGE_COPY.rosterHeading}</h3>
          </div>

          <p>{CREW_PAGE_COPY.rosterHint}</p>
        </div>

        <div className="crew-roster__grid">
          {CREW_PAGE_MEMBERS.map((member) => {
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
                      {CREW_PAGE_COPY.ready}
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
                          {CREW_PAGE_COPY.save}
                        </button>

                        <button
                          className="crew-action crew-action--small"
                          type="button"
                          onClick={cancelEditing}
                        >
                          {CREW_PAGE_COPY.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="crew-action crew-action--small"
                        type="button"
                        onClick={() => startEditing(member)}
                      >
                        {CREW_PAGE_COPY.rename}
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
