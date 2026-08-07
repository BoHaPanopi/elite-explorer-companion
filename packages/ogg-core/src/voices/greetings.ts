export type GreetingContext = {
  bordcomputerName: string;
  commanderName: string;
  isReturning: boolean;
};

type GreetingVariant = {
  online: string;
  ready: string;
  firstVisit: string;
  returning: string;
};

const greetingVariants: GreetingVariant[] = [
  {
    online: "Bordcomputer {computer} ist online.",
    ready: "Alle Systeme sind betriebsbereit.",
    firstVisit: "Willkommen im Cockpit, {commander}.",
    returning: "Willkommen zurück im Cockpit, {commander}.",
  },
  {
    online: "Bordcomputer {computer} meldet sich online.",
    ready: "Sämtliche Systeme sind einsatzbereit.",
    firstVisit: "Willkommen an Bord, {commander}.",
    returning: "Willkommen zurück an Bord, {commander}.",
  },
  {
    online: "Bordcomputer {computer} ist hochgefahren.",
    ready: "Die Systeme stehen bereit.",
    firstVisit: "Das Cockpit erwartet Sie, {commander}.",
    returning: "Schön, Sie wieder im Cockpit zu haben, {commander}.",
  },
  {
    online: "Bordcomputer {computer} ist vollständig online.",
    ready: "Alle Systeme laufen ordnungsgemäß.",
    firstVisit: "Willkommen auf Ihrem Platz, {commander}.",
    returning: "Willkommen wieder auf Ihrem Platz, {commander}.",
  },
  {
    online: "Bordcomputer {computer} ist bereit.",
    ready: "Der Systemcheck ist abgeschlossen.",
    firstVisit: "Willkommen im Cockpit, {commander}.",
    returning: "Willkommen zurück im Cockpit, {commander}.",
  },
  {
    online: "Bordcomputer {computer} läuft.",
    ready: "Alle Systeme melden Bereitschaft.",
    firstVisit: "Willkommen an Bord, {commander}.",
    returning: "Gut, Sie wieder an Bord zu haben, {commander}.",
  },
];

let lastVariantIndex = -1;

function chooseVariant(): GreetingVariant {
  const offset = 1 + Math.floor(Math.random() * (greetingVariants.length - 1));
  const index = lastVariantIndex < 0
    ? Math.floor(Math.random() * greetingVariants.length)
    : (lastVariantIndex + offset) % greetingVariants.length;
  lastVariantIndex = index;
  return greetingVariants[index];
}

export function createStartupGreeting({
  bordcomputerName,
  commanderName,
  isReturning,
}: GreetingContext): string[] {
  const variant = chooseVariant();
  const normalizedCommander = commanderName.trim();
  const commanderReference =
    normalizedCommander.toLocaleLowerCase("de-DE") === "commander"
      ? "Commander"
      : `Commander ${normalizedCommander}`;

  return [
    variant.online.replace("{computer}", bordcomputerName),
    variant.ready,
    (isReturning ? variant.returning : variant.firstVisit)
      .replace("{commander}", commanderReference),
  ];
}
