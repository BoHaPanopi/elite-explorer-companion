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
    ready: "alle Systeme sind betriebsbereit.",
    firstVisit: "willkommen im Cockpit, {commander}.",
    returning: "willkommen zurück im Cockpit, {commander}.",
  },
  {
    online: "Bordcomputer {computer} meldet sich online.",
    ready: "sämtliche Systeme sind einsatzbereit.",
    firstVisit: "willkommen an Bord, {commander}.",
    returning: "willkommen zurück an Bord, {commander}.",
  },
  {
    online: "Bordcomputer {computer} ist hochgefahren.",
    ready: "die Systeme stehen bereit.",
    firstVisit: "das Cockpit erwartet Sie, {commander}.",
    returning: "schön, Sie wieder im Cockpit zu haben, {commander}.",
  },
  {
    online: "Bordcomputer {computer} ist vollständig online.",
    ready: "alle Systeme laufen ordnungsgemäß.",
    firstVisit: "willkommen auf Ihrem Platz, {commander}.",
    returning: "willkommen wieder auf Ihrem Platz, {commander}.",
  },
  {
    online: "Bordcomputer {computer} ist bereit.",
    ready: "der Systemcheck ist abgeschlossen.",
    firstVisit: "willkommen im Cockpit, {commander}.",
    returning: "willkommen zurück im Cockpit, {commander}.",
  },
  {
    online: "Bordcomputer {computer} läuft.",
    ready: "alle Systeme melden Bereitschaft.",
    firstVisit: "willkommen an Bord, {commander}.",
    returning: "gut, Sie wieder an Bord zu haben, {commander}.",
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
