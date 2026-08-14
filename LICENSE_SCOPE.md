# License Scope

This repository contains materials under different legal terms. The `LICENSE` file does not apply indiscriminately to the entire repository.

Copyright (c) 2026 BoHaPanopi, project owner.

## Program Code: GPL-3.0-or-later

The project-owned technical program code identified below is licensed under the GNU General Public License, version 3 or, at your option, any later version (`GPL-3.0-or-later`). The official GPL version 3 text is in `LICENSE`.

This code scope consists of:

- `src/`, excluding `src/content/` and visual assets in `src/assets/`;
- `packages/ogg-core/src/`, excluding `packages/ogg-core/src/content/`;
- `packages/discord-bot/src/`, excluding `packages/discord-bot/src/content/`;
- technical Rust code in `src-tauri/src/` and `src-tauri/build.rs`;
- technical test harnesses and program assertions in `tests/` and Rust test modules, subject to the creative-literal rule below; and
- project-owned technical build, configuration, workflow, and developer-tooling files, excluding generated metadata, lockfiles, third-party material, and separately classified content.

Where a technical test contains an exact OGG, Tony, Panopi, or crew phrase, the test logic is within the GPL code scope but the copied creative expression remains within the Creative Content scope. Its inclusion as an expected literal does not grant a separate license to that creative material.

The project owner confirms that program code contributed by the project owner, including program code created or generated with assistance specifically for this project and accepted into the project, may be used by the project under `GPL-3.0-or-later`. This confirmation asserts no rights in third-party code, dependencies, marks, or assets.

## Technical Documentation: CC BY 4.0

Only the following clearly technical project documentation is licensed under the Creative Commons Attribution 4.0 International license (`CC BY 4.0`):

- `SECURITY.md`;
- `docs/SECURITY_MODEL.md`; and
- `docs/runtime-behavior.md`.

The official license text is in `LICENSE-CC-BY-4.0`. Attribution should identify `BoHaPanopi / Elite Explorer Companion` and link to the repository when reasonably practicable. Creative, brand, third-party, and quoted material is excluded unless expressly stated otherwise.

No blanket CC BY license applies to all Markdown files. README, roadmap, project-log, licensing, provenance, and mixed technical/creative documents are not included in this CC BY list.

## OGG / Brand / Creative Content: All Rights Reserved

Copyright (c) 2026 BoHaPanopi, project owner. All rights reserved, limited to rights actually held by the project owner.

The separate OGG, brand, and creative-content scope defined by `docs/LICENSE_MATRIX.md` and `docs/CREATIVE_CONTENT_RIGHTS.md` includes, in particular:

- `Old Guy of Grumpy` / OGG name, character identity, branding, and logo;
- OGG and crew portraits and project-specific character depictions;
- crew characters, names, callsigns, descriptions, and character relationships;
- Tony-specific character material;
- lore, curated OGG, Tony, Panopi, and crew sayings, greetings, dialogue, quotes, and creative tactical wording;
- creative voice, personality, dialect, performance, and design material;
- `packages/ogg-core/src/content/`;
- `src/content/`;
- `packages/discord-bot/src/content/`; and
- other material classified as OGG, brand, or creative content in `docs/LICENSE_MATRIX.md`.

The GPL license for program code grants no license for independent use of this OGG, brand, or creative content, except where mandatory law or third-party rights require otherwise. The phrase “All rights reserved” applies only to rights the project owner actually holds.

`src/assets/ogg-official-portrait.png` remains a special case. It was created with ChatGPT/OpenAI for this project and is based on or adapted from an Elite Dangerous Holo-Me image supplied by the project owner. No rights are claimed in Elite Dangerous, Frontier Developments, their marks, or protected third-party elements. See `docs/ASSET_PROVENANCE.md`.

## Third-Party Material

Dependencies, React and Vite assets, social and platform symbols, trademarks, and all other third-party material remain solely under their respective original licenses and conditions. They are not relicensed under GPL, CC BY, or the project's All-rights-reserved notice.

`THIRD_PARTY_NOTICES.md` records the current inventory and unresolved provenance. An unresolved source is not converted into a project ownership claim.

## Detailed Classification

The authoritative detailed classification is maintained in:

- `docs/LICENSE_MATRIX.md`;
- `docs/LICENSING_BOUNDARIES.md`;
- `docs/CREATIVE_CONTENT_RIGHTS.md`;
- `docs/ASSET_PROVENANCE.md`; and
- `THIRD_PARTY_NOTICES.md`.
