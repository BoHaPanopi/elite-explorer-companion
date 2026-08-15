# OGG Project Log

> Zentrale Wissensbasis für **Old Guy of Grumpy (OGG)**. Diese Datei wird nach jedem abgeschlossenen Arbeitspaket aktualisiert.

## Projektstatus

| Feld | Stand |
| --- | --- |
| Projektname | Old Guy of Grumpy (Repository: `elite-explorer-companion`) |
| Aktuelle Version | `0.14.4` |
| Letztes GitHub-Release | `v0.14.4` – Navigation and Cockpit Layout, veröffentlicht am 5. August 2026 |
| Nächster Meilenstein | `v0.15.0` – Onboard Computer Identity |
| Letzte Aktualisierung | 5. August 2026 |

## Projektziel

OGG ist eine Windows-Desktop-Begleitanwendung für **Elite Dangerous**. Sie liest lokale Journal- und Navigationsdaten, stellt Flug-, Routen- und Explorationsinformationen dar und begleitet den Commander mit deutsch- und englischsprachigen Hinweisen sowie einer lokalen OGG-Stimme.

## Architekturübersicht

- **Desktop-Shell:** Tauri 2 mit Rust-Backend in `src-tauri/`.
- **Benutzeroberfläche:** React 19, TypeScript und Vite in `src/`.
- **Datenquelle:** Das Rust-Backend erkennt Elite Dangerous, liest die Journaldateien des Spiels und erzeugt einen zentralen Snapshot für Commander-, Schiff-, System-, Navigations- und Explorationsdaten.
- **Navigation:** Route, aktuelles System, nächstes Ziel, verbleibende Sprünge und Distanz werden aus einer gemeinsamen aktiven Route abgeleitet. Der Fortschritt wird aus Journalereignissen rekonstruiert.
- **Exploration:** Rust wertet Scan-, Mapping-, Signal- und Codex-Ereignisse aus. Die UI erzeugt daraus lokalisierte Hinweise.
- **Sprache:** `SpeechService` steuert die Sprachausgabe über native lokale Windows-OneCore/WinRT-Befehle im Rust/Tauri-Backend.
- **Laufzeitüberwachung:** Das Backend überwacht Frontend-Start und Heartbeat, protokolliert Fehler und bietet eine Reparaturfunktion für einen degradierten Startzustand.
- **Updates:** Der Tauri-Updater lädt signierte Artefakte aus dem neuesten GitHub-Release. Vor der Installation werden normale Datei-/Prozesskonflikte geprüft; die Sprachausgabe benötigt keinen separaten Prozess.
- **Build und Release:** GitHub Actions baut bei Tags `v*` auf Windows, führt Node- und Rust-Tests aus und veröffentlicht die signierten Tauri-Artefakte.

## Bekannte Besonderheiten

- Zielplattform und Release-Pipeline sind derzeit auf Windows ausgerichtet.
- Die Sprachausgabe verwendet keinen separaten Prozess. Stimme, Tonhöhe, Geschwindigkeit und Lautstärke werden lokal über Windows OneCore/WinRT verarbeitet.
- Beim regulären Beenden und vor Updates sind deshalb keine speziellen TTS-Prozesse oder TTS-Dateisperren zu bereinigen.
- Die Tauri-App startet ihr Hauptfenster zunächst unsichtbar und zeigt es erst über die kontrollierte Boot-/Frontend-Ready-Sequenz.
- Die Anwendung arbeitet zweisprachig (Deutsch/Englisch); einzelne Sprach- und saisonale Inhalte sind Commander-spezifisch.
- Release-Versionen müssen synchron in `package.json`, `src-tauri/Cargo.toml` und `src-tauri/tauri.conf.json` gepflegt werden.

## Erledigte Meilensteine

- `v0.1.1` / `v0.1.2` – frühe veröffentlichte Grundlagenversionen.
- `v0.14.0` – integrierter, signierter Auto-Updater und gebündelter Voice-Sidecar.
- `v0.14.1` – englisches Sprachprofil mit Commander-spezifischen und saisonalen Regeln.
- `v0.14.2` – höhere Audio- und Startzuverlässigkeit.
- `v0.14.3` – zuverlässige Navigation: Fortschritt nach Sprüngen und Routen-Neuberechnung, konsistente Kennzahlen aus einer zentralen Route sowie Wiederherstellung nach Neustart und manueller Aktualisierung.
- `v0.14.4` – verlässlicher Tankstatus aus Journal- und Systemscandaten, verzögerte Update-Installation sowie vereinheitlichte Cockpit-Navigation und Einstellungsanordnung.

## Offene Aufgaben

- [ ] Die noch generische Vite-`README.md` durch eine projektspezifische Installations-, Entwicklungs- und Release-Dokumentation ersetzen.
- [ ] Lokale Debug-/Build-Artefakte (`__pycache__`, Testartefakte und Release-Downloads) prüfen und gegebenenfalls über `.gitignore` ausschließen.
- [ ] Versionsbezeichnungen des Debug-Sprachservers auf die aktuelle Produktversion oder eine versionsunabhängige Bezeichnung umstellen.
- [ ] Praktisch und automatisiert prüfen, dass Codex nach jeder erfolgreichen Projektänderung die lokale OGG-Instanz auf den neuen Entwicklungsstand aktualisiert und dieser lokale Build zuverlässig von der automatischen GitHub-Updateprüfung für Benutzer-Releases ausgeschlossen bleibt.

## Bekannte Fehler und Risiken

- Der Debug-Sprachserver meldet in Konsolen-/Fenstertiteln noch `OGG Alpha 0.13.1`; das ist eine veraltete Anzeige, kein festgestellter Laufzeitfehler.
- Die Projekt-README beschreibt derzeit nur das React/Vite-Template und ist daher als Betriebs- oder Entwicklerdokumentation nicht ausreichend.
- Für die aktuell in Arbeit befindlichen Änderungen an Sternklasse und verzögertem Update-Ablauf steht die vollständige Release-Verifikation noch aus.
- Darüber hinaus sind zum Stand dieser Aktualisierung keine bestätigten offenen Laufzeitfehler dokumentiert. Neue reproduzierbare Fehler mit Umgebung, Schritten und erwartetem Verhalten hier ergänzen.

## Entscheidungen

### Tauri statt reiner Webanwendung

OGG benötigt lokalen Zugriff auf Elite-Dangerous-Journale, Windows-Prozesse, lokale Windows-Stimmen und signierte Desktop-Updates. Diese Aufgaben liegen im Rust/Tauri-Backend; React bleibt für Darstellung und Interaktion zuständig.

### Journaldateien als zentrale Spieldatenquelle

Die lokale Journalhistorie liefert nachvollziehbare Ereignisse für Position, Route und Exploration, ohne eine externe Laufzeit-API vorauszusetzen. Der Backend-Snapshot verhindert, dass verschiedene UI-Bereiche dieselben Kennzahlen unterschiedlich berechnen.

### Navigation aus einer gemeinsamen aktiven Route

Aktuelle Position, nächstes Ziel, Restdistanz und verbleibende Sprünge stammen aus derselben Route. Dadurch bleiben Werte nach Sprüngen, Routenänderungen, Neustarts und manueller Aktualisierung konsistent.

### Lokale Windows-TTS statt separater Sprachruntime

Die Sprachausgabe läuft direkt im Rust/Tauri-Backend über Windows OneCore/WinRT. Es gibt keine separate Sprachruntime, keinen lokalen HTTP-Port und keinen externen TTS-Dienst. Die fachliche Sprachlogik bleibt im Frontend und in `ogg-core` getrennt von der nativen Synthese.

### Frühere PyInstaller-Laufzeit abgelöst

Der frühere Python-/PyInstaller-Sprachprozess wurde vollständig durch den nativen Windows-Pfad ersetzt. Dadurch entfallen zusätzliche Laufzeitdateien, Prozessüberwachung, Recovery-Cache und TTS-bedingte Update-Sperren.

### Hauptfenster erst nach erfolgreichem Start anzeigen

Das Fenster bleibt während der Initialisierung verborgen. Boot-Oberfläche, Frontend-Ready-Signal und Heartbeat ermöglichen einen kontrollierten Start sowie einen sichtbaren Reparaturweg statt eines leeren oder eingefrorenen Hauptfensters.

### Signierte Releases über GitHub Actions

Tags mit Präfix `v` starten den reproduzierbaren Windows-Build. Tests laufen vor der Veröffentlichung; Tauri erzeugt Update-Artefakte, die der Client über `latest.json` findet und anhand des hinterlegten öffentlichen Schlüssels prüft.

Öffentliche Alpha-Releases werden auf GitHub zusammen mit den benötigten Installer- und Updater-Artefakten veröffentlicht. Damit stehen sowohl die manuelle Installation über den veröffentlichten Installer als auch der integrierte Anwendungs-Updater über die veröffentlichten Updater-Artefakte zur Verfügung. `createUpdaterArtifacts` bleibt für normale Alpha-Builds aktiviert und wird nicht für lokale Installer-Tests deaktiviert.

## Letzte Änderungen

### 15. August 2026

- Verbindliche Public-Copy-Regel fuer neutrale Bezeichnungen konfigurierter Commander- und Sprachprofile dokumentiert.
- Automatisierten Public-Copy-Test eingefuehrt und als verpflichtenden Schritt in den Tag-Release-Workflow aufgenommen.
- Bestehende nutzersichtbare Alpha-Hinweise und oeffentliche Projektdokumentation auf neutrale Profilbezeichnungen umgestellt.

### 5. August 2026

- Release Candidate `v0.14.4` abgeschlossen: aktueller Stern wird anhand verfügbarer Jump-, Location- und primärer Scan-Daten aufgelöst; Einstellungskarten in die verbindliche Hierarchie Bordcomputer, Journal/Module, Sprache gebracht.
- UI-Arbeitspaket für Navigation, Einstellungen und Kommandozentrale umgesetzt: einheitliches OGG-Logo, vereinfachte Hero-Bereiche, neu geordnete Einstellungskarten, zentrierte Routen- und Journaltitel sowie globaler Footer-Text.
- Zentrale Projektwissensbasis `OGG_Project_Log.md` angelegt.
- Projektstand `0.14.3`, Architektur, Besonderheiten, Entscheidungen, bekannte Risiken und nächste Arbeiten dokumentiert.
- Laufende Arbeiten für Sternklassenanzeige und verzögerte Update-Installation als nächster Meilenstein `0.14.4` aufgenommen.

### Release `v0.14.3` – 5. August 2026

- Live-Routenfortschritt folgt Journal-Sprüngen und Neuplanungen.
- Aktuelle Position, nächstes Ziel, verbleibende Sprünge und Distanz verwenden eine zentrale Datenquelle.
- Abgeschlossene Routenschritte werden aus der aktiven Route entfernt.
- Routenfortschritt wird nach Neustart und manueller Journalaktualisierung konsistent rekonstruiert.

## Pflegekonvention

Nach jedem abgeschlossenen Arbeitspaket mindestens:

1. Datum und Ergebnis unter **Letzte Änderungen** ergänzen.
2. Betroffene Einträge unter **Offene Aufgaben** und **Bekannte Fehler und Risiken** aktualisieren.
3. Neue technische oder fachliche Festlegungen unter **Entscheidungen** mit Begründung festhalten.
4. Bei Releases Version, letztes GitHub-Release, nächsten Meilenstein und **Erledigte Meilensteine** aktualisieren.
