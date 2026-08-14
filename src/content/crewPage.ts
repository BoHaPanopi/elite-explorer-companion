export const CREW_PAGE_MEMBERS = [
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
] as const;

export const CREW_PAGE_COPY = {
  eyebrow: "DEUTSCHE STAMMBESATZUNG",
  heading: "Ihre Crew im Cockpit",
  introduction: "Vier Rollen, klare Zuständigkeiten und frei wählbare Namen.",
  memberCount: "Crewmitglieder",
  online: "ONLINE",
  oggRole: "BORDCOMPUTER · ERSTER OFFIZIER",
  oggSubtitle: "Old Guy of Grumpy · Bayern",
  oggBadge: "OGG",
  oggDescription:
    "Ein alter Hase mit leichtem Grant, trockenem Humor und einem großen Herzen für seinen Commander.",
  oggQuote:
    "„Old Guy of Grumpy ist der Typ, der über alles ein bisschen schimpft – außer über seinen Commander.“",
  oggTags: ["Deutsch", "Leicht bayerisch", "Trocken-humorig", "Spricht wenig"],
  playIntroduction: "▶ Vorstellung anhören",
  testGreeting: "Begrüßung testen",
  rename: "Namen ändern",
  assignedToCommander: "Zugeordnet zu Commander",
  originalCrew: "Deutsche Originalbesatzung",
  rosterEyebrow: "CREW",
  rosterHeading: "Fachoffiziere",
  rosterHint: "Namen können jederzeit geändert werden.",
  ready: "BEREIT",
  save: "Speichern",
  cancel: "Abbrechen",
} as const;
