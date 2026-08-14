# Frontier / Elite Dangerous asset sources

Status of every file in this directory: **Frontier Asset – permission requested**.

These files are third-party material owned or published by Frontier Developments plc. They are not GPL code, CC BY documentation, or OGG Creative Content. Inclusion records provenance only and does not claim ownership, permission, endorsement, or a license from Frontier. The complete directory can be removed without changing journal, rank, profile, ship, journey, or data-flow logic; the UI then uses its text fallback.

## Ship images

- Publisher and source: Frontier Developments plc, official Elite Dangerous Gamestore starship database.
- Catalog: <https://www.elitedangerous.com/store/ships>
- Detail page for each file: `https://www.elitedangerous.com/store/ships/<file-name-without-.webp>`
- Image delivery: Frontier's `image-service.zaonce.net`, requested by the official detail/catalog page; the repository copy uses the service's 1280-pixel WebP rendition without creative modification.
- Retrieved: 2026-08-14.
- Status: **permission requested**.

The catalog contained these 48 official ship images at retrieval time:

`adder.webp`, `alliance-challenger.webp`, `alliance-chieftain.webp`, `alliance-crusader.webp`, `anaconda.webp`, `asp-explorer.webp`, `asp-scout.webp`, `beluga-liner.webp`, `caspian-explorer.webp`, `cobra-mk-iii.webp`, `cobra-mk-v.webp`, `corsair.webp`, `diamondback-explorer.webp`, `diamondback-scout.webp`, `dolphin.webp`, `eagle.webp`, `federal-assault-ship.webp`, `federal-corvette.webp`, `federal-dropship.webp`, `federal-gunship.webp`, `fer-de-lance.webp`, `hauler.webp`, `imperial-clipper.webp`, `imperial-courier.webp`, `imperial-cutter.webp`, `imperial-eagle.webp`, `keelback.webp`, `kestrel-mk-ii.webp`, `krait-mk-ii.webp`, `krait-phantom.webp`, `lynx-highliner.webp`, `mamba.webp`, `mandalay.webp`, `nomad.webp`, `orca.webp`, `panther-clipper-mk-ii.webp`, `python.webp`, `python-mk-ii.webp`, `sidewinder.webp`, `type-10-defender.webp`, `type-11-prospector.webp`, `type-6-transporter.webp`, `type-7-transporter.webp`, `type-8-transporter.webp`, `type-9-heavy.webp`, `viper-mk-iii.webp`, `viper-mk-iv.webp`, and `vulture.webp`.

## Rank badges

No rank image file is stored here. Frontier's official Journal Manual documents the base rank values 0–8 for Combat, Trade, Exploration, and Exobiology; Frontier's official Update 12 notes also confirm Elite I–V. Together with current local Journal values, the application must therefore accept levels 0–13 for all four categories.

No official Frontier page or downloadable official series was found that exposes the individual Explorer, Exobiologist, Trade, and Combat badge files with a sufficiently traceable file-level origin. Copying them from a fan wiki, extracting them from an unknown package, or recreating them was therefore rejected. `src/features/frontierAssets.ts` deliberately keeps the four rank maps empty until Frontier supplies or approves a suitable source.

Official references:

- Frontier Journal Manual v34: <https://hosting.zaonce.net/community/journal/v34/Journal_Manual_v34.pdf>
- Frontier Update 12 notes: <https://www.elitedangerous.com/news/elite-dangerous-odyssey-update-12-update-notes>
