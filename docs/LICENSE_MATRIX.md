# File and License Matrix

This matrix records the current repository structure and active license boundary. The exact grants and exclusions are stated in `LICENSE_SCOPE.md`. This matrix does not replace the official license texts, third-party notices, or trademark conditions.

## A. GPL Code

The following self-developed technical code is licensed under `GPL-3.0-or-later`:

| Repository area | Classification |
| --- | --- |
| `src/` except `src/content/` and visual assets in `src/assets/` | Desktop application logic, React component behavior, state, event handling, local storage, formatting, service boundaries, TTS control, and technical UI implementation |
| `packages/ogg-core/src/` except `packages/ogg-core/src/content/` | Shared selection, randomization, repetition prevention, event, profile-resolution, formatting, and API logic |
| `packages/discord-bot/src/` except `packages/discord-bot/src/content/` | Bot command handling, API interaction, permission checks, selection, caching, interpolation, and service logic |
| `src-tauri/src/` and `src-tauri/build.rs` | Rust application shell, commands, journal and local processing, updater/runtime integration, and native speech control |
| `tests/` and Rust test modules | Technical test harness and program assertions, subject to the creative-literal special case below |
| Project-owned build and developer tooling | Technical configuration and scripts such as TypeScript, Vite, ESLint, package, Cargo, and workflow configuration; generated metadata and third-party dependency records are not thereby classified as authored GPL code |

The presence of a necessary OGG name, role, identifier, storage key, log label, or protocol term in technical code does not license the associated brand or character identity.

## B. OGG / Brand / Creative Content

The following are separate content and are not included in the GPL code scope:

| Repository area | Separate content |
| --- | --- |
| `src/content/` | App-side crew records, legacy crew-page copy, voice-preview lines, localized UI copy, tactical OGG wording, and OGG-, Tony-, and crew-specific wording |
| `packages/ogg-core/src/content/` | Startup pools, curated OGG/Panopi/Tony dialogue, exploration and landing wording, Commander profiles, and OGG voice/personality reference data |
| `packages/discord-bot/src/content/` | OGG command and onboarding copy, emoji personality/reaction data, and presentation branding |
| Project-generated visuals listed in `docs/ASSET_PROVENANCE.md` | OGG logo, favicon, app icon set, `hero.png`, and crew portraits; All rights reserved to the extent the project owner holds those rights |
| OGG identity and creative documentation | `Old Guy of Grumpy` / OGG identity, lore, character descriptions, design and voice guidelines, curated sayings, dialogue collections, and expressly marked creative material |

These materials are All rights reserved to the extent the project owner holds those rights. The GPL license for program code must not be read as permission to use the OGG name, identity, branding, portraits, characters, lore, dialogue, or other creative assets independently.

## C. Third-Party Material

Third-party code, dependency metadata, assets, and marks remain under their actual upstream conditions and outside the classification of self-developed project code or project-specific OGG assets.

| Repository area or item | Required treatment |
| --- | --- |
| `src/assets/react.svg` and `src/assets/vite.svg` | React and Vite upstream asset and mark terms |
| `public/icons.svg` | Recognizable Discord, Bluesky, GitHub, and X marks plus generic social and documentation symbols. Exact copied-file provenance and license are not sufficiently evidenced; applicable platform trademark rules remain controlling. |
| `src/assets/frontier/elite-dangerous/ships/` | Official Frontier / Elite Dangerous ship imagery; permission requested. File provenance is recorded in the adjacent `SOURCES.md`. The removable central resolver does not reclassify the images as project assets. |
| Future `src/assets/frontier/elite-dangerous/ranks/` badges | Frontier third-party material; no badge files currently included because a sufficiently traceable official downloadable series was not found. Permission requested. |
| npm and Cargo dependencies, lockfile entries, and referenced build actions | Their own upstream licenses and notices; inclusion in dependency or workflow metadata does not make them project code |

No ownership or relicensing claim is made for third-party or trademark material.

## D. Special Cases

| Item | Boundary |
| --- | --- |
| `src/assets/ogg-official-portrait.png` | Separate OGG creative/brand asset created with ChatGPT/OpenAI from a project-owner-provided Elite Dangerous Holo-Me reference. It is not treated as a wholly independent original work, and no Frontier Developments or other third-party rights are claimed. |
| Tests containing exact creative strings | Test logic is GPL code; copied expected dialogue or other creative literals retain the classification of their authoritative content source. |
| `src/content/uiMessages.ts` and other functional copy in content files | Program logic is separated, but ordinary functional UI text and creative OGG/Tony/crew wording share a content module. Final terms may require data-level classification or a finer content split. |
| Mixed documentation | README, roadmap, project logs, security documents, and similar files may combine technical explanation, product history, brand references, and creative material. Documentation licensing remains a separate decision. |
| Technically necessary brand terms | Short names, roles, IDs, type names, keys, command names, and log labels identify the product or protocol but do not place the OGG brand in the code-license scope. |
| Generated files and distribution artifacts | Build metadata such as `*.tsbuildinfo`, lockfiles, installers, archives, and generated bundles follow their inputs and included materials; they are not independent evidence of ownership or license scope. |
| `src/pages/CrewPage.tsx` | Preserved legacy UI component, currently unreferenced by the app module graph. Its technical behavior is separated from the authoritative creative data in `src/content/crewPage.ts`. |

## Remaining Licensing and Release Work

After activation and before a fully noticed release, the project still needs to:

- decide whether any future public license will be offered for OGG, brand, portraits, crew, Tony, lore, dialogue, or other Creative Content; currently it is All rights reserved;
- classify exact creative literals retained in tests and decide whether functional and creative UI copy need a finer data split;
- verify third-party source, license, notice, attribution, and trademark requirements, including unresolved symbols in `public/icons.svg`;
- decide how documentation is licensed;
- preserve the special Holo-Me provenance boundary for `ogg-official-portrait.png`; and
- align package metadata, notices, source archives, installers, generated bundles, and other release artifacts with the final boundary.

The repository review found no concrete third-party program source or file-level rights conflict in the GPL-code scope. The project owner's rights confirmation is recorded in `LICENSE_SCOPE.md`.

The detailed rationale remains in `docs/LICENSING_BOUNDARIES.md`; the separate Creative Content boundary is in `docs/CREATIVE_CONTENT_RIGHTS.md`; visual provenance remains in `docs/ASSET_PROVENANCE.md`; and dependency and mark findings are maintained in `THIRD_PARTY_NOTICES.md`.
