export type FrontierAsset = { src: string; alt: string };
import type { RankCategory } from "./missionProfile";

// Rank artwork stays empty until Frontier provides or approves a traceable
// redistributable source. Journal rank handling remains independent of assets.
const RANK_ASSETS: Readonly<Partial<Record<RankCategory, Readonly<Record<number, FrontierAsset>>>>> = {
  explore: {}, exobiologist: {}, trade: {}, combat: {},
};

function officialShip(src: string, name: string): FrontierAsset {
  return { src, alt: `Elite Dangerous – ${name}` };
}

const SHIP_IMAGES = {
  adder: officialShip(new URL("../assets/frontier/elite-dangerous/ships/adder.webp", import.meta.url).href, "Adder"),
  "alliance-challenger": officialShip(new URL("../assets/frontier/elite-dangerous/ships/alliance-challenger.webp", import.meta.url).href, "Alliance Challenger"),
  "alliance-chieftain": officialShip(new URL("../assets/frontier/elite-dangerous/ships/alliance-chieftain.webp", import.meta.url).href, "Alliance Chieftain"),
  "alliance-crusader": officialShip(new URL("../assets/frontier/elite-dangerous/ships/alliance-crusader.webp", import.meta.url).href, "Alliance Crusader"),
  anaconda: officialShip(new URL("../assets/frontier/elite-dangerous/ships/anaconda.webp", import.meta.url).href, "Anaconda"),
  "asp-explorer": officialShip(new URL("../assets/frontier/elite-dangerous/ships/asp-explorer.webp", import.meta.url).href, "Asp Explorer"),
  "asp-scout": officialShip(new URL("../assets/frontier/elite-dangerous/ships/asp-scout.webp", import.meta.url).href, "Asp Scout"),
  "beluga-liner": officialShip(new URL("../assets/frontier/elite-dangerous/ships/beluga-liner.webp", import.meta.url).href, "Beluga Liner"),
  "caspian-explorer": officialShip(new URL("../assets/frontier/elite-dangerous/ships/caspian-explorer.webp", import.meta.url).href, "Caspian Explorer"),
  "cobra-mk-iii": officialShip(new URL("../assets/frontier/elite-dangerous/ships/cobra-mk-iii.webp", import.meta.url).href, "Cobra Mk III"),
  "cobra-mk-v": officialShip(new URL("../assets/frontier/elite-dangerous/ships/cobra-mk-v.webp", import.meta.url).href, "Cobra Mk V"),
  corsair: officialShip(new URL("../assets/frontier/elite-dangerous/ships/corsair.webp", import.meta.url).href, "Corsair"),
  "diamondback-explorer": officialShip(new URL("../assets/frontier/elite-dangerous/ships/diamondback-explorer.webp", import.meta.url).href, "Diamondback Explorer"),
  "diamondback-scout": officialShip(new URL("../assets/frontier/elite-dangerous/ships/diamondback-scout.webp", import.meta.url).href, "Diamondback Scout"),
  dolphin: officialShip(new URL("../assets/frontier/elite-dangerous/ships/dolphin.webp", import.meta.url).href, "Dolphin"),
  eagle: officialShip(new URL("../assets/frontier/elite-dangerous/ships/eagle.webp", import.meta.url).href, "Eagle"),
  "federal-assault-ship": officialShip(new URL("../assets/frontier/elite-dangerous/ships/federal-assault-ship.webp", import.meta.url).href, "Federal Assault Ship"),
  "federal-corvette": officialShip(new URL("../assets/frontier/elite-dangerous/ships/federal-corvette.webp", import.meta.url).href, "Federal Corvette"),
  "federal-dropship": officialShip(new URL("../assets/frontier/elite-dangerous/ships/federal-dropship.webp", import.meta.url).href, "Federal Dropship"),
  "federal-gunship": officialShip(new URL("../assets/frontier/elite-dangerous/ships/federal-gunship.webp", import.meta.url).href, "Federal Gunship"),
  "fer-de-lance": officialShip(new URL("../assets/frontier/elite-dangerous/ships/fer-de-lance.webp", import.meta.url).href, "Fer-de-Lance"),
  hauler: officialShip(new URL("../assets/frontier/elite-dangerous/ships/hauler.webp", import.meta.url).href, "Hauler"),
  "imperial-clipper": officialShip(new URL("../assets/frontier/elite-dangerous/ships/imperial-clipper.webp", import.meta.url).href, "Imperial Clipper"),
  "imperial-courier": officialShip(new URL("../assets/frontier/elite-dangerous/ships/imperial-courier.webp", import.meta.url).href, "Imperial Courier"),
  "imperial-cutter": officialShip(new URL("../assets/frontier/elite-dangerous/ships/imperial-cutter.webp", import.meta.url).href, "Imperial Cutter"),
  "imperial-eagle": officialShip(new URL("../assets/frontier/elite-dangerous/ships/imperial-eagle.webp", import.meta.url).href, "Imperial Eagle"),
  keelback: officialShip(new URL("../assets/frontier/elite-dangerous/ships/keelback.webp", import.meta.url).href, "Keelback"),
  "kestrel-mk-ii": officialShip(new URL("../assets/frontier/elite-dangerous/ships/kestrel-mk-ii.webp", import.meta.url).href, "Kestrel Mk II"),
  "krait-mk-ii": officialShip(new URL("../assets/frontier/elite-dangerous/ships/krait-mk-ii.webp", import.meta.url).href, "Krait Mk II"),
  "krait-phantom": officialShip(new URL("../assets/frontier/elite-dangerous/ships/krait-phantom.webp", import.meta.url).href, "Krait Phantom"),
  "lynx-highliner": officialShip(new URL("../assets/frontier/elite-dangerous/ships/lynx-highliner.webp", import.meta.url).href, "Lynx Highliner"),
  mamba: officialShip(new URL("../assets/frontier/elite-dangerous/ships/mamba.webp", import.meta.url).href, "Mamba"),
  mandalay: officialShip(new URL("../assets/frontier/elite-dangerous/ships/mandalay.webp", import.meta.url).href, "Mandalay"),
  nomad: officialShip(new URL("../assets/frontier/elite-dangerous/ships/nomad.webp", import.meta.url).href, "Nomad"),
  orca: officialShip(new URL("../assets/frontier/elite-dangerous/ships/orca.webp", import.meta.url).href, "Orca"),
  "panther-clipper-mk-ii": officialShip(new URL("../assets/frontier/elite-dangerous/ships/panther-clipper-mk-ii.webp", import.meta.url).href, "Panther Clipper Mk II"),
  python: officialShip(new URL("../assets/frontier/elite-dangerous/ships/python.webp", import.meta.url).href, "Python"),
  "python-mk-ii": officialShip(new URL("../assets/frontier/elite-dangerous/ships/python-mk-ii.webp", import.meta.url).href, "Python Mk II"),
  sidewinder: officialShip(new URL("../assets/frontier/elite-dangerous/ships/sidewinder.webp", import.meta.url).href, "Sidewinder"),
  "type-10-defender": officialShip(new URL("../assets/frontier/elite-dangerous/ships/type-10-defender.webp", import.meta.url).href, "Type-10 Defender"),
  "type-11-prospector": officialShip(new URL("../assets/frontier/elite-dangerous/ships/type-11-prospector.webp", import.meta.url).href, "Type-11 Prospector"),
  "type-6-transporter": officialShip(new URL("../assets/frontier/elite-dangerous/ships/type-6-transporter.webp", import.meta.url).href, "Type-6 Transporter"),
  "type-7-transporter": officialShip(new URL("../assets/frontier/elite-dangerous/ships/type-7-transporter.webp", import.meta.url).href, "Type-7 Transporter"),
  "type-8-transporter": officialShip(new URL("../assets/frontier/elite-dangerous/ships/type-8-transporter.webp", import.meta.url).href, "Type-8 Transporter"),
  "type-9-heavy": officialShip(new URL("../assets/frontier/elite-dangerous/ships/type-9-heavy.webp", import.meta.url).href, "Type-9 Heavy"),
  "viper-mk-iii": officialShip(new URL("../assets/frontier/elite-dangerous/ships/viper-mk-iii.webp", import.meta.url).href, "Viper Mk III"),
  "viper-mk-iv": officialShip(new URL("../assets/frontier/elite-dangerous/ships/viper-mk-iv.webp", import.meta.url).href, "Viper Mk IV"),
  vulture: officialShip(new URL("../assets/frontier/elite-dangerous/ships/vulture.webp", import.meta.url).href, "Vulture"),
} as const;

const SHIP_TYPES: Readonly<Record<string, keyof typeof SHIP_IMAGES>> = {
  adder: "adder", anaconda: "anaconda", asp: "asp-explorer", asp_scout: "asp-scout", belugaliner: "beluga-liner",
  cobramkiii: "cobra-mk-iii", cobramkv: "cobra-mk-v", corsair: "corsair", cutter: "imperial-cutter",
  diamondback: "diamondback-scout", diamondbackxl: "diamondback-explorer", dolphin: "dolphin", eagle: "eagle",
  empire_courier: "imperial-courier", empire_eagle: "imperial-eagle", empire_trader: "imperial-clipper",
  explorer_nx: "caspian-explorer", federation_corvette: "federal-corvette", federation_dropship: "federal-dropship",
  federation_dropship_mkii: "federal-assault-ship", federation_gunship: "federal-gunship", ferdelance: "fer-de-lance",
  hauler: "hauler", independant_trader: "keelback", krait_light: "krait-phantom", krait_mkii: "krait-mk-ii",
  lakonminer: "type-11-prospector", lander01: "nomad", mamba: "mamba", mandalay: "mandalay",
  mediumtransport01: "lynx-highliner", orca: "orca", panthermkii: "panther-clipper-mk-ii", python: "python",
  python_nx: "python-mk-ii", sidewinder: "sidewinder", smallcombat01_nx: "kestrel-mk-ii", type6: "type-6-transporter",
  type7: "type-7-transporter", type8: "type-8-transporter", type9: "type-9-heavy", type9_military: "type-10-defender",
  typex: "alliance-chieftain", typex_2: "alliance-crusader", typex_3: "alliance-challenger",
  viper: "viper-mk-iii", viper_mkiv: "viper-mk-iv", vulture: "vulture",
};

export function resolveRankAsset(category: RankCategory, level: number | null | undefined): FrontierAsset | null {
  return level == null ? null : RANK_ASSETS[category]?.[level] ?? null;
}

export function resolveExploreRankAsset(level: number | null | undefined): FrontierAsset | null {
  return resolveRankAsset("explore", level);
}

export function resolveShipAsset(shipType: string | null | undefined): FrontierAsset | null {
  if (!shipType) return null;
  const image = SHIP_TYPES[shipType.toLocaleLowerCase()];
  return image ? SHIP_IMAGES[image] : null;
}
