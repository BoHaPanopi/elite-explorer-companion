# Third-Party Notices

This is the current inventory based on the manifests, lockfiles, installed package metadata, repository history, and identifiable assets. It is not a project license, does not alter upstream terms, and must be regenerated and completed for each release bundle.

Before distribution, exact transitive versions and license texts must be regenerated from the release lockfiles and actual build output. Copyright notices and license texts required by each distributed component must accompany the corresponding release.

## 1. Direct Software Dependencies

### JavaScript and Node Runtime

| Dependency | Current resolved version | Declared license |
| --- | ---: | --- |
| React / React DOM | 19.2.8 | MIT |
| `@tauri-apps/api` | 2.11.1 | Apache-2.0 OR MIT |
| `@tauri-apps/plugin-process` | 2.3.1 | MIT OR Apache-2.0 |
| `@tauri-apps/plugin-updater` | 2.10.1 | MIT OR Apache-2.0 |
| `@tauri-apps/plugin-window-state` | 2.4.1 | MIT OR Apache-2.0 |
| `discord.js` | 14.27.0 | Apache-2.0 |
| `dotenv` | 16.6.1 | BSD-2-Clause |

`ogg-core` is an internal private workspace package and is not a third-party dependency.

### Rust Runtime and Build Dependencies

The direct Rust dependencies declared in `src-tauri/Cargo.toml` are:

- Tauri, `tauri-build`, and the Tauri log, process, updater, and window-state plugins — Apache-2.0 OR MIT;
- `serde`, `serde_json`, and `log` — MIT OR Apache-2.0;
- `windows` and `windows-sys` — MIT OR Apache-2.0; and
- `cpal` — Apache-2.0.

The precise resolved versions remain controlled by `src-tauri/Cargo.lock`. Microsoft Windows APIs and locally installed Windows voices are invoked through these libraries; no Windows voice package or Microsoft voice binary is stored in this repository.

### Development Tooling

The direct development dependencies are predominantly MIT, Apache-2.0, or dual MIT/Apache-2.0. They include TypeScript, Vite, the React Vite plugin, ESLint and its plugins, Tauri CLI, `tsup`, type declarations, and supporting lint configuration packages. Development-only presence does not by itself mean that every tool is redistributed with the application.

## 2. Special and Transitive License Cases

The current npm lockfile contains packages under MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, BlueOak-1.0.0, CC-BY-4.0, and MPL-2.0.

Notable cases are:

- `lightningcss` 1.33.0 and its platform-specific packages — MPL-2.0;
- `caniuse-lite` 1.0.30001806 — CC-BY-4.0 data package;
- `minimatch` 10.2.6 — BlueOak-1.0.0; and
- `tslib` 2.8.1 — 0BSD.

The Rust lockfile includes the MPL-2.0 crates `cssparser`, `cssparser-macros`, `dtoa-short`, `selectors`, and `option-ext`. Their inclusion path is transitive. MPL-2.0 covered files remain under MPL-2.0; when covered binaries or source are distributed, the release process must retain required notices and make the corresponding covered source available as required by that license. No modification to those upstream packages was found in this repository.

No direct GPL, AGPL, non-commercial, or source-available dependency was identified in the reviewed manifests and current installed metadata. This is not a substitute for a release-time scan of every resolved target-specific dependency.

## 3. Required Release-Time Dependency Inventory

The final release process should generate an inventory from:

- `package-lock.json` and the exact production bundle;
- `src-tauri/Cargo.lock` and the exact target-specific Cargo dependency graph;
- GitHub Actions and other downloaded build tools used for the release; and
- any installer or updater payload actually shipped.

That generated inventory should include package name, exact version, license expression, upstream copyright notice, source URL, required license text, and whether the component is shipped or build-only.

## 4. Visual and Trademark Assets

| Repository item | Finding | Required treatment |
| --- | --- | --- |
| `src/assets/react.svg` | Recognizable React logo; introduced with the initial Tauri/Vite scaffold. The React software project is MIT-licensed, but the repository does not document a separate source or trademark grant for this exact SVG. | Keep separate from project assets. Preserve applicable upstream notice and follow React/Meta trademark requirements. Exact asset provenance/license is **Herkunft/Lizenz nicht ausreichend belegt**. |
| `src/assets/vite.svg` | Recognizable Vite logo; introduced with the initial Tauri/Vite scaffold. Vite software is MIT-licensed, but the repository does not document a separate source or trademark grant for this exact SVG. | Keep separate from project assets. Preserve applicable upstream notice and follow Vite brand requirements. Exact asset provenance/license is **Herkunft/Lizenz nicht ausreichend belegt**. |
| `public/icons.svg` — `discord-icon` | Recognizable Discord/Clyde symbol. | Discord retains its brand assets; use only under Discord's current brand guidelines, without implying affiliation. Exact copied-file source is **Herkunft/Lizenz nicht ausreichend belegt**. |
| `public/icons.svg` — `bluesky-icon` | Recognizable Bluesky butterfly symbol. | Treat as a Bluesky mark and do not claim project ownership. The repository contains no source, license, or attribution record: **Herkunft/Lizenz nicht ausreichend belegt**. |
| `public/icons.svg` — `github-icon` | Recognizable GitHub Invertocat symbol. | Use only consistently with GitHub's logo policy, for example as a secondary link to GitHub without implying endorsement. Exact copied-file source is **Herkunft/Lizenz nicht ausreichend belegt**. |
| `public/icons.svg` — `x-icon` | Recognizable X symbol. | Use only under X's current brand toolkit and trademark guidelines without implying endorsement. Exact copied-file source is **Herkunft/Lizenz nicht ausreichend belegt**. |
| `public/icons.svg` — `documentation-icon` | Generic documentation/code symbol. | No source or license record exists: **Herkunft/Lizenz nicht ausreichend belegt**. |
| `public/icons.svg` — `social-icon` | Generic profile/social symbol. | No source or license record exists: **Herkunft/Lizenz nicht ausreichend belegt**. |

The React and Vite SVGs and every symbol in `public/icons.svg` first appear in the initial project commit. The repository does not preserve generator metadata, original download URLs, or asset-specific notices that would establish more precise provenance.

Official reference pages for final verification include:

- [React upstream repository and MIT license](https://github.com/facebook/react);
- [Vite MIT license](https://github.com/vitejs/vite/blob/main/LICENSE);
- [Discord Brand Guidelines](https://discord.com/branding);
- [GitHub Logo Policy](https://docs.github.com/en/site-policy/other-site-policies/github-logo-policy) and [GitHub Brand Toolkit](https://brand.github.com/foundations/logo); and
- [X Brand Toolkit](https://about.x.com/en/who-we-are/brand-toolkit).

These references do not establish that the repository copies came from those exact downloads. No sufficiently specific official source and asset terms were established for the copied Bluesky path during this audit.

## 5. Project and Creative Assets Excluded from This Notice

Project-specific generated portraits, `hero.png`, favicon, OGG logo, and application icon set are classified in `docs/ASSET_PROVENANCE.md` and `docs/CREATIVE_CONTENT_RIGHTS.md`. They are not third-party software dependencies. The special Elite Dangerous Holo-Me boundary for `src/assets/ogg-official-portrait.png` remains documented there and is not converted into a third-party license claim here.
