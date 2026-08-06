# OGG Roadmap

Diese Datei beschreibt ausschließlich die geplante zukünftige Entwicklung von OGG. Abgeschlossene Arbeiten und der aktuelle Projektstand stehen in [`OGG_Project_Log.md`](./OGG_Project_Log.md). Alle Vorhaben unterliegen der Identität und den Produktprinzipien aus [`OGG_AI_CONTEXT.md`](./OGG_AI_CONTEXT.md).

Zeitpunkte sind bewusst nicht fest zugesagt. Umfang und Reihenfolge können sich nach Erprobung ändern; die Versionsziele beschreiben die beabsichtigte Produktentwicklung.

## Vision

OGG entwickelt sich zu einem ruhigen, verlässlichen Bordcomputer für lange Reisen in Elite Dangerous. Navigation, Exploration und Exobiologie werden in einem einheitlichen Cockpitbild zusammengeführt. Persönliche Commander-Profile, natürliches Audio und später VR- sowie Besatzungsfunktionen erweitern die Erfahrung, ohne Übersicht und Ruhe zu verlieren.

## Version 0.14.x – Fundament festigen

Schwerpunkt: Zuverlässigkeit der vorhandenen Kernfunktionen und konsistente Navigationsdaten.

- Sternklasse des relevanten Routensterns zuverlässig anzeigen.
- Tankbarkeit und unbekannte Sternklassen eindeutig unterscheiden.
- Update im Hintergrund laden und kontrolliert beim Beenden installieren.
- Datei- und Prozesssperren vor Updates verständlich behandeln.
- Startdiagnose, Recovery und Voice-Sidecar-Lebenszyklus weiter absichern.
- Navigation, Update und Commander-Profile mit automatisierten Tests stabilisieren.
- Debug- und Release-Dokumentation bereinigen.

## Version 0.15 – Ausbau des Bordcomputers

Schwerpunkt: OGG wird schrittweise zu einem ruhigen, verlässlichen und persönlichen Bordcomputer ausgebaut. Alle zukünftigen Funktionen sollen auf einer gemeinsamen Bordcomputer-Architektur aufbauen.

- Ruhigen, verlässlichen Bordcomputer als zentrale Produktidentität etablieren.
- Navigation, Exploration und Exobiologie als gemeinsames Cockpit-System vorbereiten.
- Persönliche Commander-Profile als Grundlage des Bordcomputers integrieren.
- Natürliches Audio- und Meldungssystem vereinheitlichen.
- Priorisierte Bordcomputer-Meldungen mit klaren Unterbrechungsregeln einführen.
- Voice-Sidecar als festen Bestandteil des Bordcomputers integrieren.
- Lokale Verarbeitung und Datenschutz als Grundprinzip festschreiben.
- Einheitliche Cockpit-Darstellung als Basis für alle zukünftigen Module schaffen.
- Vorbereitung für VR-, Second-Screen- und Overlay-Unterstützung.
- Erweiterbare Architektur für Navigation, Exploration, Exobiologie und zukünftige Bordcomputer-Funktionen schaffen.
- Commander-Profile als persönliche Erweiterung des Bordcomputers vorbereiten.
- Langfristige Grundlage für Wing-/Multicrew-Unterstützung schaffen.
- Audio-Ruhephasen, Priorisierung und konsistente Sprachführung vereinheitlichen.
- Gemeinsame Bordcomputer-Architektur dokumentieren und als Referenz für alle folgenden Versionen festlegen.

## Version 0.16 – Exploration Console

Schwerpunkt: Aus Journalereignissen einen klaren, handlungsorientierten Explorationsstatus erzeugen.

- Systemfortschritt für FSS, DSS und biologische Signale zusammenführen.
- Neue, bekannte und vom Commander selbst entdeckte Funde klar unterscheiden.
- Wertvolle oder unvollständige Scan-Ziele priorisieren, ohne unbelegte Werte vorzutäuschen.
- Kompakte Systemübersicht mit Körpern, Scanstatus und offenen Aktionen einführen.
- Ruhige Audiohinweise für abgeschlossene oder noch lohnende Explorationsschritte ergänzen.
- Verlauf der aktuellen Sitzung lokal nachvollziehbar machen.

## Version 0.17 – Exobiology Field Support

Schwerpunkt: Exobiologie vom ersten Signal bis zur abgeschlossenen Probe begleiten.

- Biologische Signale pro Himmelskörper bündeln.
- Probenfortschritt und noch erforderliche Schritte sichtbar machen, soweit Journaldaten dies zuverlässig erlauben.
- Fundorte und relevante Beobachtungen lokal erfassen.
- Unbekannte, bereits bekannte und potenziell neue Codex-Funde eindeutig kennzeichnen.
- Exobiologie-Ansicht für schnelle Erfassung während Flug und SRV-/On-foot-Phasen optimieren.
- Seltene, nicht aufdringliche Audiohinweise für Proben- und Codexereignisse ergänzen.

## Version 0.18 – Adaptive Navigation

Schwerpunkt: Vorausschauende Reiseunterstützung aus einer zentralen, verlässlichen Route.

- Kraftstoff- und Tankbarkeitskontext entlang der nächsten Routenschritte darstellen.
- Warnung vor längeren Abschnitten ohne tankbaren Stern entwickeln.
- Neuberechnete und abgebrochene Routen transparent behandeln.
- Expeditionsziele, Wegpunkte und Fortschritt ergänzen.
- Navigationsmeldungen nach Dringlichkeit priorisieren und Audio-Wiederholungen vermeiden.
- Optionale kompakte Overlay-/Second-Screen-Ansicht erproben.

## Version 0.19 – Personal Cockpit

Schwerpunkt: OGG wird persönlicher, ohne seine gemeinsame Kernidentität zu verlieren.

- Commander-Profile als klar getestetes, erweiterbares System ausbauen.
- Profilspezifische Sprache, Anrede und ausgewählte Ereignisreaktionen ermöglichen.
- Weitere natürliche Sprachfassungen nur mit eigenständig formuliertem OGG-Stil ergänzen.
- Audio-Prioritäten, Abstände und Ruhephasen konfigurierbar machen.
- Cockpit-Layouts und Informationsdichte in begrenzten, konsistenten Profilen anbieten.
- Erste experimentelle Wing-/Multicrew-Sitzungsansicht hinter einer optionalen Funktion erproben.

## Version 1.0 – Trusted Onboard Computer

Schwerpunkt: Stabiler, dokumentierter und vollständig integrierter Bordcomputer für den täglichen Einsatz.

- Navigation, Exploration und Exobiologie als zusammenhängende Produkterfahrung abschließen.
- Robuste Installation, Updates, Recovery und Migration zwischen Versionen sicherstellen.
- Barrierefreiheit, Tastaturbedienung und skalierbare Cockpit-Darstellung abschließen.
- VR-tauglichen Betriebsmodus mit hoher Lesbarkeit und geringer visueller Unruhe bereitstellen.
- Wing-/Multicrew-Unterstützung für verlässlich verfügbare gemeinsame Ereignisse produktionsreif machen.
- Commander-Profile, Datenschutz und lokale Datenhaltung vollständig dokumentieren.
- Release-, Diagnose- und Supportabläufe für einen stabilen Betrieb etablieren.

## Langfristige Ziele

- Ein Bordcomputer, dessen Verhalten über UI und Audio hinweg unverwechselbar und konsistent bleibt.
- Lokale Verarbeitung und geringe Abhängigkeit von externen Diensten.
- Vorausschauende Hinweise ohne Spekulation oder Informationsüberlastung.
- Eine modulare Grundlage für Navigation, Exploration, Exobiologie und Besatzungssituationen.
- Gute Nutzbarkeit auf klassischem Monitor, Second Screen und in VR.
- Verlässliche Langzeitreisen mit nachvollziehbarer Expeditionshistorie.

## Geplante Funktionen

- Zentraler Expeditions- und Sitzungsverlauf.
- Wegpunkte, Reiseziele und Fortschrittsübersicht.
- Kontextbezogene, priorisierte Bordcomputer-Meldungen.
- Erweiterbare Commander-Profile.
- Kompakte Cockpit- und Overlay-Ansichten.
- Diagnoseexport mit datensparsamen, verständlichen Informationen.
- Sichere Migration lokaler Einstellungen und Profile.

## UI-Meilensteine

- Navigationskarte mit Sternklasse und Tankbarkeit vervollständigen.
- Explorationsfortschritt als schnell erfassbare Systemansicht einführen.
- Exobiologie als fokussierten Arbeitsmodus ergänzen.
- Informationshierarchie für hohe Auflösungen, Second Screens und VR vereinheitlichen.
- Barrierefreiheit, Skalierung, Kontrast und Bedienung ohne Maus systematisch prüfen.
- Animationen auf erklärende Zustandswechsel begrenzen.

## Audio-Meilensteine

- Zentrale Prioritäts- und Unterbrechungsregeln für alle Meldungen definieren.
- Wiederholungen und überlappende Ausgaben zuverlässig verhindern.
- Navigations-, Explorations- und Exobiologie-Vokabular natürlich in jedem Profil formulieren.
- Ruhephasen und Ereignisdrosselung einführen.
- Voice-Sidecar, Recovery und Update-Verhalten weiter härten.
- Optionale Ausgabegeräte- und Lautstärkesteuerung prüfen.

## Exploration

- Journalereignisse zu einem belastbaren Systemfortschritt verdichten.
- Noch offene Scans und Kartierungen erkennbar machen.
- Eigentümerschaft einer Entdeckung nur anzeigen, wenn Journaldaten sie bestätigen.
- Relevante Funde hervorheben, ohne den Commander mit Einzelereignissen zu überladen.
- Expeditionshistorie lokal und nachvollziehbar führen.

## Exobiologie

- Biologische Signale pro Körper und System strukturieren.
- Proben- und Codexstatus sichtbar machen.
- Fundnotizen und lokale Positionskontexte prüfen.
- Seltene Funde ruhig, aber eindeutig hervorheben.
- Bedienung für schnelle Wechsel zwischen Flug, SRV und On-foot optimieren.

## Navigation

- Sternklasse, Tankbarkeit, Restdistanz und Sprünge aus einer gemeinsamen Route ableiten.
- Kraftstoffrisiken entlang der Route frühzeitig sichtbar machen.
- Routenänderungen, Abschluss und Wiederaufnahme konsistent behandeln.
- Expeditionswegpunkte und optionale Alternativziele unterstützen.
- Navigationsinformationen vor dekorativen oder atmosphärischen Inhalten priorisieren.

## Commander-Profile

- Deutsch bleibt das Standardprofil.
- Commander `Helitony` aktiviert automatisch das englische Commander-Profil.
- Aktivierung basiert auf bestätigter Commander-Identität und wird automatisiert getestet.
- Neue Profile verändern natürliche Sprache und persönliche Nuancen, nicht OGGs Kerncharakter.
- Profilkonfiguration und lokale Speicherung erhalten klare Migrationsregeln.

## VR-Unterstützung

- Lesbarkeit, Kontrast, Textgröße und Blickwege früh in allen neuen Ansichten berücksichtigen.
- Einen ruhigen VR-Modus mit minimaler Bewegung und großen Interaktionszielen entwickeln.
- Overlay- und Fensterverhalten mit realen VR-Setups erproben.
- Audio als ergänzenden, aber niemals alleinigen Informationskanal nutzen.
- VR-Unterstützung nur als stabil deklarieren, wenn Bedienung und Performance praktisch validiert sind.

## Wing-/Multicrew-Unterstützung

- Zuerst prüfen, welche gemeinsamen Zustände aus verfügbaren Journaldaten verlässlich ableitbar sind.
- Wing-Mitglieder, gemeinsame Ziele und relevante Ereignisse kompakt darstellen.
- Rollenbezogene Meldungen für Pilot, Navigation und taktische Situationen untersuchen.
- Datenschutz und lokale Kontrolle bei geteilten Informationen beibehalten.
- Keine Netzwerk- oder Synchronisationsfunktion versprechen, bevor Datenquelle und Fehlerverhalten validiert sind.
