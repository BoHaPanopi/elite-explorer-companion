# Licensing Boundaries

This document records the binding boundary between GPL-licensed program code and separately handled OGG, brand, and creative content in Elite Explorer Companion.

The active grants and exclusions are stated in `LICENSE_SCOPE.md`. This document explains the classification and does not replace the official license texts, Creative Content notice, or third-party license and trademark notices. No single license applies to the repository as a whole.

## 1. GPL Code Scope

The project's self-developed technical program code is licensed under `GPL-3.0-or-later`. This generally includes:

- application and state-management logic;
- navigation, exploration, and exobiology logic;
- event and journal processing;
- selection, randomization, sequencing, and repetition prevention;
- integration interfaces and trust boundaries;
- permission, allowlist, and grant logic;
- local data storage and processing logic;
- UI behavior and component logic;
- technical voice and local TTS control;
- diagnostics, update, installer, and runtime-control code; and
- tests of program behavior, except for separately classified creative literals embedded in test expectations.

The GPL scope must not be interpreted as granting rights in OGG branding, character identity, creative text, portraits, or other separately classified content merely because the program loads or displays those materials.

## 2. Separate OGG, Brand, and Creative Content

The following remain outside the GPL code license and are All rights reserved to the extent the project owner holds those rights:

- the name and identity `Old Guy of Grumpy` / OGG;
- the OGG logo and visual branding;
- the OGG portrait;
- crew portraits and other project-specific character depictions;
- OGG lore and character descriptions;
- OGG design and voice guidelines;
- curated OGG sayings, greetings, quotes, dialogue, and voice-reference content;
- Tony-specific sayings, messages, profiles, and character content;
- creative crew names, callsigns, regional identities, dialogue, and descriptions; and
- any other material explicitly identified as creative content.

Visual-asset provenance is recorded separately in `docs/ASSET_PROVENANCE.md`. No additional public license is granted for OGG, brand, portrait, crew, Tony, or other Creative Content.

## 3. Implemented Technical Boundary

Creative data has been separated from the code that selects, formats, stores, or presents it.

### Shared OGG Core Content

`packages/ogg-core/src/content/` is the authoritative shared creative-content boundary:

- `startupGreetings.ts` — OGG and Panopi startup pools;
- `tony.ts` — Tony greeting variants, startup pool, welcome and seasonal messages, tactical wording, and other Tony-specific copy;
- `explorationMessages.ts` — exploration and exobiology voice variants and templates;
- `landingPermissionMessages.ts` — landing-reminder wording and fallback station label;
- `commanderProfiles.ts` — named Commander-specific profile records; and
- `oggVoiceReferenceProfile.ts` — OGG personality, voice-reference, and reference-sentence data.

The following modules now contain technical behavior rather than embedded creative pools:

- `packages/ogg-core/src/quotes.ts`;
- `packages/ogg-core/src/voices/greetings.ts`;
- `packages/ogg-core/src/voices/exploration.ts`;
- `packages/ogg-core/src/voices/landingPermission.ts`;
- `packages/ogg-core/src/features/tonyEdition.ts`; and
- `packages/ogg-core/src/commanderProfiles.ts`.

Their existing public APIs remain stable. `packages/ogg-core/src/voices/oggReferenceProfile.ts` is a compatibility re-export whose authoritative data source is the corresponding content module.

### Desktop-App Content

`src/content/` contains app-side data that was previously embedded in technical modules:

- `crewProfiles.ts` — crew names, callsigns, regions, role assignments, and portrait mappings;
- `crewPage.ts` — the legacy crew-page roster, OGG description, labels, and actions;
- `crewVoicePreview.ts` — localized crew preview lines and the Anna-to-OGG reference sentence;
- `tacticalOfficer.ts` — OGG tactical comments and opponent-warning wording; and
- `uiMessages.ts` — UI and localized message tables, including OGG-, Tony-, and crew-specific wording.

The following modules now retain the behavior that consumes those data sources:

- `src/features/crewProfiles.ts` — types, locale fallback, storage, selection, and portrait lookup;
- `src/features/crewVoicePreview.ts` — voice-profile selection and preview construction; and
- `src/i18n.tsx` — language state, persistence, lookup, and interpolation.

### Discord-Bot Content

`packages/discord-bot/src/content/` contains:

- `commandCopy.ts` — OGG command descriptions, replies, greeting context, and signature;
- `onboardingCopy.ts` — localized onboarding and rules copy;
- `oggEmojiContent.ts` — OGG emoji identities and personality/reaction pattern data; and
- `brand.ts` — the Discord presentation color used for OGG.

Discord commands and services retain command registration, event handling, API interaction, permission checks, language resolution, interpolation, random selection, caching, reaction selection, and error handling.

## 4. Remaining Mixed or Special Cases

The primary runtime pools and character records identified by the audit now have single authoritative content sources. A few deliberate or broader cases remain:

- `src/content/uiMessages.ts` contains both ordinary functional UI copy and OGG-specific creative wording. It is now separate from program logic, but its eventual content-license classification may require finer data-level grouping.
- `src/pages/CrewPage.tsx` is an unreferenced legacy presentation component and is not currently reachable from the app's module graph. Its older roster and OGG copy now reside in `src/content/crewPage.ts`; the component itself retains only UI, storage, and editing behavior. It was preserved rather than deleted so that any later activation or retirement is an explicit product decision.
- Brand names and short product identifiers necessarily remain in component markup, command identifiers, storage keys, logs, and technical types. Their presence identifies the product or protocol and does not by itself place the OGG brand under the code license.
- Tests may retain exact expected creative strings to prevent unauthorized wording changes. Those literals follow the Creative Content boundary even though the surrounding test harness is GPL code.
- Release notices and one-off explanatory component copy outside the new content directories were not broadly refactored because they were not authoritative OGG/Tony/crew content pools. They still require classification in the final file-level licensing inventory.

## 5. Why the Separation Preserves Behavior

The refactor changes where data is declared, not how it is selected or used:

- array order is preserved;
- creative strings and placeholders are preserved;
- OGG, Panopi, `helitony`, and `helitony2` identity rules are unchanged;
- random-selection and non-repetition state remain in the technical modules;
- exported OGG Core APIs used by the app, Discord bot, and tests remain available; and
- each moved creative item has one authoritative data declaration.

## 6. Third-Party and Trademark Material

React, Vite, and social or platform symbols remain outside both the GPL classification of self-developed code and the classification of project-specific OGG creative assets.

This includes at least:

- `src/assets/react.svg`;
- `src/assets/vite.svg`; and
- third-party or trademark symbols in `public/icons.svg`.

They must later be documented and distributed under their actual upstream license, attribution, and trademark conditions.

## 7. Final Rights and Documentation Review

### Repository Rights Review

The final repository review found:

- all substantive commits in the available Git history are authored by `BoHaPanopi <panopi80@googlemail.com>`;
- two commits authored as `Copilot <copilot@github.com>` are empty checkpoint commits and introduce no file changes;
- no vendored library source, copied third-party source block, third-party copyright header, or separately licensed source file was found in the GPL-code directories;
- the initial commit contains a recognizable Tauri/Vite application scaffold, whose direct software dependencies use permissive MIT and/or Apache-2.0 terms; and
- ordinary package-manager dependencies remain external dependencies rather than project-owned source.

The history does not record file-level use of generation or coding-assistance tools. Assisted or generated code accepted into commits under the project owner's identity is therefore classified as project code for this inventory, but the repository alone cannot prove the factual authority behind every such contribution. No concrete problematic foreign program code was found.

### Documentation Boundary

A split treatment is recommended:

- the clearly technical documents `docs/SECURITY_MODEL.md`, `SECURITY.md`, and `docs/runtime-behavior.md` are licensed under `CC BY 4.0`; and
- OGG lore, design and voice guidelines, character and crew specifications, and creative portions of mixed roadmap or project-history documents should remain within the separate creative-content boundary unless explicitly licensed later.

No blanket documentation license applies because several documents combine technical facts with OGG identity, lore, voice, design, and character content. The exact CC BY list is in `LICENSE_SCOPE.md`.

The treatment of exact creative strings in technical tests is specified in `docs/CREATIVE_CONTENT_RIGHTS.md`: the test harness is GPL code, while copied expected literals retain the classification of their authoritative creative source.

## 8. Remaining Licensing and Release Work

After activation and before a fully noticed release, the project must still:

- decide whether any future public license will be offered for OGG, brand, portrait, crew, Tony, or other Creative Content; currently it is All rights reserved;
- classify exact creative literals retained by tests and any remaining release/UI copy;
- preserve the special Holo-Me provenance and rights boundary of `ogg-official-portrait.png`;
- verify all third-party license, attribution, notice, and trademark requirements;
- decide how project documentation itself will be licensed;
- complete release-time transitive dependency and notice generation from the exact lockfiles and target build; and
- ensure package metadata, notices, source distributions, and release artifacts express the same boundaries consistently.

The active code and documentation licenses and the Creative Content exclusion are stated in `LICENSE_SCOPE.md`.
