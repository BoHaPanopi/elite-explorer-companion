# OGG Roadmap

**Veröffentlichte Roadmap:** <https://bohapanopi.github.io/elite-explorer-companion/>

Diese Datei beschreibt ausschließlich die geplante zukünftige Entwicklung von OGG. Abgeschlossene Arbeiten und der aktuelle Projektstand stehen in [`OGG_Project_Log.md`](./OGG_Project_Log.md). Alle Vorhaben unterliegen der Identität und den Produktprinzipien aus [`OGG_AI_CONTEXT.md`](./OGG_AI_CONTEXT.md).

Zeitpunkte sind bewusst nicht fest zugesagt. Umfang und Reihenfolge können sich nach Erprobung ändern; die Versionsziele beschreiben die beabsichtigte Produktentwicklung.

## Vision

OGG entwickelt sich zu einem ruhigen, verlässlichen Bordcomputer für lange Reisen in Elite Dangerous. Navigation, Exploration und Exobiologie werden in einem einheitlichen Cockpitbild zusammengeführt. Persönliche Commander-Profile, natürliches Audio und später VR- sowie Besatzungsfunktionen erweitern die Erfahrung, ohne Übersicht und Ruhe zu verlieren.

## Entwicklungsreihenfolge

Bordcomputer → Navigation → Exploration → Exobiologie → Integrationen → Personal Cockpit → Wing/Multicrew → Mobile Companion

Navigation ist kein späteres Zusatzmodul, sondern das bereits funktionierende Fundament, auf dem Exploration und Exobiologie aufbauen.

## Verbindliche Versionsreihenfolge

- 0.14.x – Fundament festigen
- 0.15 – Bordcomputer
- 0.16 – Navigation
- 0.17 – Exploration
- 0.18 – Exobiologie
- 0.19 – Integrationen und Cockpit-Steuerung
- 0.20 – Personal Cockpit
- 0.21 – Wing / Multicrew
- 0.22 – Mobile Companion
- 0.23+ – Erweiterungen und Spezialmodule
- 1.0 – Trusted Onboard Computer

## Version 0.14.x – Fundament festigen

Schwerpunkt: Zuverlässigkeit der vorhandenen Kernfunktionen und konsistente Navigationsdaten.

- Sternklasse des relevanten Routensterns zuverlässig anzeigen.
- Tankbarkeit und unbekannte Sternklassen eindeutig unterscheiden.
- Update im Hintergrund laden und kontrolliert beim Beenden installieren.
- Datei- und Prozesssperren vor Updates verständlich behandeln.
- Startdiagnose, Recovery und Voice-Sidecar-Lebenszyklus weiter absichern.
- Navigation, Update und Commander-Profile mit automatisierten Tests stabilisieren.
- Debug- und Release-Dokumentation bereinigen.

## Version 0.15 – Bordcomputer

Schwerpunkt: Den Bordcomputer mit OGG und seiner Crew vollständig definieren und als feste Produktgrundlage abschließen.

Verbindliche Crew-Namensspezifikation: [`docs/OGG_CREW_SPEC_0_15.md`](./docs/OGG_CREW_SPEC_0_15.md)

- OGG vollständig festlegen: Charakter, Verhalten, originaler Oberland-Dialekt, Ansprache, Ereignislogik und Wiederholungsregeln.
- OGGs Crew vollständig festlegen: Mitglieder, Namen, Aufgaben, Zuständigkeiten, Persönlichkeiten, Stimmen sowie Verhältnis zu OGG und Commander.
- Kommunikationsregeln zwischen OGG und Crew festlegen: Prioritäten, Zuständigkeiten, Unterbrechungsregeln und keine überlappenden Meldungen.
- Ereignisbasierte Sprachlogik mit ausreichend Varianten bereitstellen und identische Wiederholungen innerhalb normaler Sessions vermeiden.
- Sprachprinzip verbindlich festlegen: System/UI und Crew in gewählter Sprache, OGG immer im originalen Oberland-Dialekt.
- Commander-Erkennung und persönliche Ansprache stabil integrieren, bestehende Sonderprofile weiterführen.
- Bordcomputername nach Ersteinrichtung wieder umbenennbar machen.
- Namen lokal dauerhaft speichern sowie bestehende Namen und Einstellungen bei Updates übernehmen.
- Umbenennung in allen unterstützten Sprachen anbieten und neuen Namen sofort in UI, Begrüßung und Sprachausgabe verwenden.
- Leere oder ungültige Namen sicher behandeln.
- Zentrale Bordcomputer-Einstellungen als verbindliche Basis bereitstellen.
- Lokalen Status als Grundlage späterer Module festlegen.
- Audio- und Meldungssystem vereinheitlichen, inklusive Prioritäts- und Unterbrechungsregeln.
- Voice-Sidecar stabilisieren.
- Lokale Verarbeitung und Datenschutz beibehalten.
- Sicherheitsgrundsaetze fuer least privilege, lokale Verarbeitung, klare Integrationsgrenzen und fail-closed-Verhalten verbindlich dokumentieren.

Definition nach 0.15: OGG, Crew und Bordcomputer sind in Identität, Sprache, Rollen und Grundverhalten festgelegt. Spätere Alphas erweitern Fähigkeiten, nicht die grundlegende Identität.

## Version 0.16 – Navigation

Schwerpunkt: Die bereits funktionierende Navigation als verlässliches Datenfundament fertigstellen und erweitern.

- Aktuelles System, nächster Sprung, Zielsystem, verbleibende Sprünge und Restdistanz robust darstellen.
- Sternklasse, Tankbarkeit und Kraftstoffkontext aus einer gemeinsamen aktiven Route ableiten.
- Vorausschauende Navigationslogik fuer Fuel Horizon, Sicherheitsreserve und Fuel-Scoop-Beruecksichtigung auf Basis der in 0.15 definierten Navigator-Prinzipien technisch umsetzen.
- Vor längeren Abschnitten ohne tankbaren Stern warnen.
- Neuberechnung, Abbruch, Abschluss und Wiederaufnahme von Routen konsistent behandeln.
- Expeditionsziele, Wegpunkte und Fortschritt ergänzen.
- Priorisierte Navigationsmeldungen mit ruhiger Ausgabe einführen und Audio-Wiederholungen vermeiden.
- Navigation als belastbare Grundlage für Exploration und Exobiologie festschreiben.

## Version 0.17 – Exploration

Schwerpunkt: Auf Basis der Navigation einen belastbaren Explorationsstatus erzeugen.

- FSS, DSS und Entdeckungszustände in eine klare Systemübersicht zusammenführen.
- Neue, bekannte und eigene Funde unterscheiden.
- First Discovery nur bei bestätigten Journaldaten anzeigen.
- Kartierungszustände nur bei bestätigten Journaldaten anzeigen.
- Wertvolle oder unvollständige Scan-Ziele priorisieren.
- Keine unbelegten Werte anzeigen.
- Kompakte Systemübersicht mit Körpern, Scanstatus und offenen Aktionen bereitstellen.
- Unentdeckte, bereits entdeckte und unvollständig gescannte Systeme unterscheiden.
- Ruhige Audiohinweise nutzen; OGG reagiert ereignisbasiert auf den tatsächlichen Zustand.
- Lokalen Explorations- und Sitzungsverlauf nachvollziehbar führen.

## Version 0.18 – Exobiologie

Schwerpunkt: Navigation und Exploration um vollständige Exobiologie-Unterstützung erweitern.

- Biosignale pro Körper und System bereitstellen.
- Bekannte, neue und potenziell neue Funde unterscheiden.
- First Footfall nur bei bestätigten Daten anzeigen.
- Probenfortschritt, noch erforderliche Schritte, Fundorte und Beobachtungen strukturiert darstellen.
- Codexstatus klar führen.
- Flug-, SRV- und On-foot-Unterstützung durchgängig abbilden.
- Seltene, ruhige Bio-, Codex- und Proben-Audiohinweise ergänzen.

## Version 0.19 – Integrationen und Cockpit-Steuerung

Schwerpunkt: Stabile Bordcomputer-Funktionen über gemeinsame sichere Schnittstellen extern steuerbar machen.

- Aktivierungswort als zentrale Schnittstelle.
- VoiceAttack-Anbindung inklusive importierbarem VoiceAttack-Profil.
- Offene Anbindung für weitere Sprachsteuerungsprogramme.
- Stream-Deck-Unterstützung inklusive importierbarem Stream-Deck-Profil.
- Gemeinsames Befehlsmodell für Integrationen.
- Explizite lokale Berechtigungen pro Integration.
- Sichere lokale Kommunikation und keine ungefragte Datenübertragung.
- Export, Import und Versionsmigration der Integrationsprofile.
- Allowlist-Modell, widerrufbare lokale Grants und sichere Transportgrenzen fuer Integrationen festziehen.

## Version 0.20 – Personal Cockpit

Schwerpunkt: Der Commander richtet Darstellung und Arbeitsweise seines Cockpits persönlich ein.

Wichtig: Hier werden OGG, Crew oder Bordcomputer-Grundidentität nicht neu definiert. Alle grundlegenden Identitätsentscheidungen gehören in 0.15.

- Cockpit-Layouts, Informationsdichte und sichtbare Bereiche personalisieren.
- Persönliche Anzeigeoptionen und gespeicherte Cockpit-Konfigurationen verwalten.
- Kompakte Cockpit-, Overlay- und Second-Screen-Ansichten anbieten.
- Audio-Prioritäten, Abstände und Ruhephasen als persönliche Nutzungseinstellungen konfigurierbar machen.
- Sichere Migration persönlicher Cockpit-Konfigurationen.
- Vorbereitung auf hohe Auflösungen, Second Screen und VR.

## Version 0.21 – Wing / Multicrew

Schwerpunkt: Gemeinsame Expeditionen und Besatzungssituationen.

- Nur verlässlich ableitbare gemeinsame Zustände verwenden.
- Wing-Mitglieder, gemeinsame Ziele und relevante gemeinsame Ereignisse darstellen.
- Rollenbezogene Meldungen und gemeinsame Sitzungsansicht ergänzen.
- Datenschutz und lokale Kontrolle beibehalten.
- Keine Netzwerk- oder Synchronisationsversprechen ohne validierte Grundlage.

## Version 0.22 – Mobile Companion

Schwerpunkt: Mobile und externe Geräte auf Basis stabiler Schnittstellen anbinden.

- Android, iOS und mobile Weboberfläche unterstützen.
- Status, Navigation und ausgewählte sichere Bordcomputer-Funktionen verfügbar machen.
- Gemeinsames Befehlsmodell wiederverwenden.
- Berechtigungen, Datenschutz und lokale Kontrolle beibehalten.
- Verbindungsabbrüche dürfen den Kernbetrieb nicht beeinflussen.

## Version 0.23+ – Erweiterungen und Spezialmodule

- Weitere Expeditionsfunktionen.
- VR-spezifische Betriebsarten.
- Weitere externe Darstellungen.
- Zusätzliche Crew- und Spezialmodule nur, wenn architektonisch passend.
- OGG-Identität darf nicht verwässert werden.

## Version 1.0 – Trusted Onboard Computer

Schwerpunkt: Stabiler, dokumentierter und vollständig integrierter Bordcomputer für den täglichen Einsatz.

- Navigation, Exploration und Exobiologie als zusammenhängende Produkterfahrung abschließen.
- Robuste Installation, Updates, Recovery und Migration zwischen Versionen sicherstellen.
- Barrierefreiheit, Tastaturbedienung und skalierbare Cockpit-Darstellung abschließen.
- VR-tauglichen Betriebsmodus mit hoher Lesbarkeit und geringer visueller Unruhe bereitstellen.
- Wing-/Multicrew-Unterstützung für verlässlich verfügbare gemeinsame Ereignisse produktionsreif machen.
- Commander-Profile, Datenschutz und lokale Datenhaltung vollständig dokumentieren.
- Release-, Diagnose- und Supportabläufe für einen stabilen Betrieb etablieren.
- Release-/Installer-Signierung, produktionsreife Update-Integritaet und vollstaendige Sicherheitsdokumentation abschliessen.

## Community / Infrastruktur

Dieser Bereich läuft parallel zur App-Roadmap und ist kein App-Alpha.

- Discord-Server
- Discord-Bot
- Onboarding
- Regeln
- Rollen
- Community-Funktionen
- Patreon
- Ko-fi

## Leitende Langfristziele

- Ein Bordcomputer, dessen Verhalten über UI und Audio hinweg unverwechselbar und konsistent bleibt.
- Lokale Verarbeitung und geringe Abhängigkeit von externen Diensten.
- Vorausschauende Hinweise ohne Spekulation oder Informationsüberlastung.
- Eine modulare Grundlage für Navigation, Exploration, Exobiologie und Besatzungssituationen.
- Gute Nutzbarkeit auf klassischem Monitor, Second Screen und in VR.
- Verlässliche Langzeitreisen mit nachvollziehbarer Expeditionshistorie.
