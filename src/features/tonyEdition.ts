export type TonyProfile = "helitony" | "helitony2";
export type TonyMessageType = "welcome" | "seasonal";

const welcomeMessages: Record<TonyProfile, string> = {
  helitony: `Welcome aboard, Tony.

Thank you for being the very first external Commander
to help shape the future of OGG.

Your friendship,
your support,
and your honest feedback
mean more to me than you probably realise.

Take your time,
enjoy the journey,
and welcome aboard.

Fly safe, my friend.

o7`,
  helitony2: `Welcome back, Tony.

Guardian of the Black...

The Fuel Rats chapter may be closed...

...yet Helitony2 is still quietly watching over the road between Colonia and Sagittarius A*.

Some habits are simply part of who we are.

Fly safe, my friend.

o7`,
};

export const seasonalMessage = `Tony...

Don't forget to put the Christmas tree
in the cockpit.

And this year...

don't forget to take it out again
after Christmas.

😄

Fly safe.

o7`;

export function resolveTonyProfile(commander: string | null | undefined): TonyProfile | null {
  if (commander === "Helitony") return "helitony";
  if (commander === "Helitony2") return "helitony2";
  return null;
}

export function resolveActiveTonyProfile(commander: string | null | undefined, eliteConnected: boolean): TonyProfile | null {
  return eliteConnected ? resolveTonyProfile(commander) : null;
}

export function getTonyWelcomeMessage(profile: TonyProfile): string {
  return welcomeMessages[profile];
}

export function isTonySeason(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() >= 1 && date.getDate() <= 26;
}

export function tonyWelcomeStorageKey(profile: TonyProfile): string {
  return `ogg.tonyEdition.welcome.${profile}`;
}

export function tonySeasonalStorageKey(year: number): string {
  return `ogg.tonyEdition.seasonal.${year}`;
}
