export type GreetingContext = {
  bordcomputerName: string;
  commanderName: string;
  isReturning: boolean;
};

const firstVisitGreetings = [
  "Willkommen im Cockpit, Commander {commander}.",
  "Willkommen an Bord, Commander {commander}.",
  "Cockpit bereit. Willkommen, Commander {commander}.",
];

const returningGreetings = [
  "Willkommen zurück im Cockpit, Commander {commander}.",
  "Schön, Sie wieder im Cockpit zu haben, Commander {commander}.",
  "Willkommen zurück an Bord, Commander {commander}.",
];

function choose<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createStartupGreeting({
  bordcomputerName,
  commanderName,
  isReturning,
}: GreetingContext): string[] {
  const template = choose(
    isReturning ? returningGreetings : firstVisitGreetings,
  );

  return [
    `Bordcomputer ${bordcomputerName} ist online.`,
    "Alle Systeme betriebsbereit.",
    template.replace("{commander}", commanderName),
  ];
}
