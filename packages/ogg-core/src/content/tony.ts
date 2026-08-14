import type { ThreatLevel } from "../types/tactical.ts";
import type { TonyProfile } from "../features/tonyEdition.ts";

export type TonyGreetingVariant = {
  online: string;
  ready: string;
  firstVisit: string;
  returning: string;
};

export const TONY_GREETING_VARIANTS: TonyGreetingVariant[] = [
  {
    online: "Onboard computer {computer} is online.",
    ready: "All systems are ready.",
    firstVisit: "Welcome to the cockpit, {commander}.",
    returning: "Welcome back to the cockpit, {commander}.",
  },
  {
    online: "Onboard computer {computer} reporting in.",
    ready: "Everything is up and running.",
    firstVisit: "Good to have you aboard, {commander}.",
    returning: "Good to have you back aboard, {commander}.",
  },
  {
    online: "Onboard computer {computer} is awake.",
    ready: "The ship is ready when you are.",
    firstVisit: "The cockpit is yours, {commander}.",
    returning: "The cockpit has been waiting for you, {commander}.",
  },
  {
    online: "Onboard computer {computer} is fully online.",
    ready: "All systems are behaving themselves.",
    firstVisit: "Welcome aboard, {commander}.",
    returning: "Welcome back aboard, {commander}.",
  },
  {
    online: "Onboard computer {computer} is ready.",
    ready: "The system check came back clean.",
    firstVisit: "Settle in, {commander}.",
    returning: "Settle back in, {commander}.",
  },
  {
    online: "Onboard computer {computer} is running.",
    ready: "The ship is in good order.",
    firstVisit: "Your seat is ready, {commander}.",
    returning: "Your seat is ready again, {commander}.",
  },
];

export const TONY_START_POOL = [
  "Master Chief",
  "King of the Loop of Shame",
  "Yeah, rollercoaster time again",
  "I'm ready, and you?",
  "Come on, my friend, do you have no RL?",
  "I hope the old days are back",
] as const;

export const TONY_TACTICAL_COMMENTS: Record<ThreatLevel, string> = {
  green: "They have picked the wrong ship today.",
  yellow: "I would not underestimate that one.",
  orange: "Right. This is getting uncomfortable.",
  red: "That is our cue to leave. No need to make a ceremony of it.",
};

export const TONY_WELCOME_MESSAGES: Record<TonyProfile, string> = {
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

export const TONY_TACTICAL_TEXT = Object.freeze({
  missionTargetTitle: "Mission target: {pilotName}",
  wantedPilotTitle: "Wanted pilot: {pilotName}",
  scanTitle: "Scan by {pilotName}",
  missionTargetDetail: "Mission target",
  wantedDetail: "Wanted, not a mission target",
  cleanDetail: "Clean",
  wingDetail: " · Wing of {wingSize} ships",
  bountyDetail: " · Expected bounty {bounty} Cr",
  severeOpponentWarning: "Pilot {pilotName}. You scanned us. Consider this your first and final warning.",
  standardOpponentWarning: "Pilot {pilotName}. You scanned us. Before you do anything foolish, I would think that through once more.",
});
