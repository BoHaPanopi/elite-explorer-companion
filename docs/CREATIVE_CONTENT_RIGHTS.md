# Creative Content Rights Boundary

This document defines the protected OGG, brand, and creative-content boundary for Elite Explorer Companion.

Copyright (c) 2026 BoHaPanopi, project owner. All rights reserved, limited to rights actually held by the project owner.

No public license is granted for the materials described here. In particular, the `GPL-3.0-or-later` license for technical program code does not license these materials automatically or authorize their independent use, except where mandatory law or third-party rights require otherwise.

## 1. Protected Identity and Branding Scope

The separate creative and brand scope includes, in particular:

- the name and character identity `Old Guy of Grumpy` / OGG;
- the OGG logo, visual identity, colors when used as OGG branding, and project-specific presentation;
- the OGG portrait and other OGG character depictions;
- crew portraits, crew characters, names, callsigns, regional identities, descriptions, and character relationships;
- Tony-specific character identity, messages, greetings, seasonal material, and dialogue;
- OGG, Tony, Panopi, and crew sayings, greetings, dialogue pools, quotes, tactical comments, and curated wording;
- OGG lore, character descriptions, and other narrative material;
- creative voice, personality, dialect, performance, and design guidelines; and
- any other material expressly classified as OGG, brand, character, or creative content in `docs/LICENSE_MATRIX.md`.

Technically necessary references such as names, IDs, type names, command names, storage keys, and log labels may remain in program code. Their presence identifies the product, character, or protocol and does not place the underlying identity or brand in the GPL code-license scope.

## 2. Repository Content Boundary

The following directories are designated content boundaries rather than automatic GPL-code scope:

- `packages/ogg-core/src/content/`;
- `src/content/`; and
- `packages/discord-bot/src/content/`.

They contain both clearly creative material and, in places, ordinary functional UI wording. Where one file contains both kinds of data, the file's placement keeps it outside the automatic GPL-code classification until final content terms or a finer data-level split are chosen.

Creative and brand documentation includes at least:

- `OGG_AI_CONTEXT.md`;
- `OGG_LORE.md`;
- `docs/OGG_CREW_SPEC_0_15.md`, to the extent it defines characters, personalities, dialogue, or creative crew relationships;
- `docs/OGG_DESIGN_GUIDELINE.md`; and
- `docs/OGG_VOICE_GUIDELINE.md`.

Mixed documents such as the README, roadmap, and project log must be classified section by section or retained outside any automatic technical-documentation license until a final documentation policy exists.

## 3. Visual Creative Assets

The separate scope includes the project-specific generated visuals recorded in `docs/ASSET_PROVENANCE.md`, especially the OGG logo and branding, application icon set, `hero.png`, OGG portrait, and crew portraits.

This classification does not assert rights beyond the provenance information already established, and it does not include React, Vite, social-platform, or other third-party marks.

## 4. OGG Portrait and Holo-Me Reference

`src/assets/ogg-official-portrait.png` was created with ChatGPT/OpenAI for this project, based on or adapted from an Elite Dangerous Holo-Me image of the project owner's character supplied by the project owner.

Accordingly, it is a separate OGG creative and brand asset, not ordinary GPL program code and not represented as a wholly independent original project asset. The project does not claim rights in Elite Dangerous, Frontier Developments, or protected material belonging to any other rights holder. The detailed provenance and unresolved reuse boundary remain in `docs/ASSET_PROVENANCE.md` and are not replaced by this summary.

## 5. Exact Creative Literals in Tests

Technical test logic may later be placed in the GPL-code scope even when it compares runtime output with an exact protected phrase. The copied expected phrase remains classified with its authoritative creative-content source; its appearance in a test is not a separate public license grant for that phrase or the underlying character content.

Practical final treatment should therefore:

- keep exact-text tests where they protect approved wording or behavior;
- identify their authoritative content module in the file-level inventory or accompanying notice;
- avoid describing the entire test file as granting independent rights in copied creative literals; and
- use a repository-level scope statement or narrow file annotation when final licenses are activated, rather than weakening or deleting the tests.

No test refactor is required solely for this boundary.

## 6. No Additional Public Content License

No additional terms for reuse, modification, redistribution, attribution, or commercial use of OGG, brand, portrait, crew, Tony, lore, dialogue, or other creative material are granted by this repository.

Nothing in this document authorizes use of those materials or of third-party marks and references.
