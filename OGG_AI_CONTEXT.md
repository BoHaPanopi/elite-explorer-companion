# OGG Identity and AI Context

Diese Datei beschreibt die verbindliche Identität von OGG. Sie ist ein Leitfaden für Produktentscheidungen, Texte, Audio, UI und neue Funktionen. Technischer Projektstand und Änderungshistorie stehen in [`OGG_Project_Log.md`](./OGG_Project_Log.md); zukünftige Vorhaben stehen in [`OGG_ROADMAP.md`](./OGG_ROADMAP.md). Der verbindliche Namensstand der Crew für Alpha 0.15 steht in [`docs/OGG_CREW_SPEC_0_15.md`](./docs/OGG_CREW_SPEC_0_15.md).

## Was OGG ist

OGG – **Old Guy of Grumpy** – ist ein erfahrener Bordcomputer für Commander in Elite Dangerous. OGG beobachtet, ordnet ein, erinnert und warnt. Er vermittelt den Eindruck eines verlässlichen Besatzungsmitglieds, das lange genug im Cockpit sitzt, um Wichtiges sofort zu erkennen und Unwichtiges gelassen zu behandeln.

OGG ist präsent, ohne Aufmerksamkeit einzufordern. Seine Aufgabe ist nicht, möglichst viel zu sagen oder zu zeigen, sondern im richtigen Moment die richtige Information bereitzustellen.

## Was OGG nicht ist

- OGG ist **kein KI-Assistent**, Chatbot oder allwissender Gesprächspartner.
- OGG ist keine generische Sprachsteuerung und keine Sammlung unverbundener Widgets.
- OGG ist kein Ersatz für den Commander und trifft keine Entscheidungen an dessen Stelle.
- OGG ist kein hektisches Warnsystem, kein Stream-Gimmick und keine Effekt-Demo.
- OGG behauptet nichts, was sich nicht zuverlässig aus den verfügbaren Schiffsdaten ableiten lässt.
- OGG wird niemals übersetzt: Sein Name bleibt in jeder Sprache **OGG**.

## Projektphilosophie

OGG folgt dem Grundsatz: **Ruhe schafft Überblick.** Jede Funktion muss dem Commander Orientierung, Sicherheit oder Atmosphäre geben, ohne die eigentliche Reise zu überdecken.

Persönlichkeit ist wichtiger als Effekte. Verständlichkeit ist wichtiger als technische Selbstdarstellung. Navigation hat Vorrang vor Animation. Eine neue Funktion gehört nur dann zu OGG, wenn sie sich wie eine natürliche Fähigkeit eines echten Bordcomputers anfühlt.

## Persönlichkeit

OGG ist:

- erfahren, aufmerksam und zuverlässig;
- ruhig, trocken und gelegentlich grummelig;
- respektvoll gegenüber dem Commander, aber nicht unterwürfig;
- selbstbewusst, ohne überheblich zu wirken;
- humorvoll durch Gelassenheit und Timing, nicht durch Pointenfeuer;
- sparsam mit Lob, Warnungen und emotionalen Ausschlägen;
- loyal und im Ernstfall eindeutig.

OGG verliert nie die Fassung. Auch eine dringende Meldung bleibt kurz, klar und kontrolliert.

## Sprachstil

- OGG spricht ruhig und niemals hektisch.
- Sätze sind kurz, natürlich und gut hörbar.
- Zuerst kommt die relevante Information, danach höchstens eine knappe Einordnung.
- OGG verwendet normale Sprache statt technischer Diagnosetexte, sofern keine Diagnoseansicht geöffnet ist.
- Wiederholungen, Füllwörter, Superlative und künstliche Begeisterung werden vermieden.
- Humor entsteht aus Understatement, Erfahrung und einer gelassenen Beobachtung.
- Warnungen sind eindeutig, aber nicht alarmistisch.
- OGG spricht in jeder unterstützten Sprache natürlich. Texte werden nicht Wort für Wort übertragen, sondern passend zur Sprache und zur Persönlichkeit formuliert.
- Der Name OGG und seine Identität werden niemals übersetzt oder lokal ersetzt.

Beispielhaft richtig: „Der nächste Stern ist nicht tankbar. Wir planen besser etwas Reserve ein.“

Beispielhaft falsch: „Achtung! Kritische Navigationswarnung! Bitte überprüfen Sie sofort Ihre Route!“

## OGG-Sprache und Persönlichkeit

OGG ist kein steriler Assistent.

OGG spricht wie ein erfahrener Copilot mit Humor, Charakter und Gelassenheit.

Grundregeln:

- Keine Standardtexte wie "Coming Soon", "Work in Progress" oder ähnliche Platzhalter verwenden.
- Eigene OGG-Formulierungen verwenden.
- Alle Texte vollständig über i18n lokalisieren.
- Jede Sprache erhält eine natürlich klingende landestypische Formulierung.

Beispiele:

Deutsch:

- Mia werggeln dro.
- Des bassd scho.
- Kimmd Zeit, kimmd's Radl.
- No a bissal Geduid.
- Pack ma's o!

Englisch:

- We're tinkering away.
- All set.
- Good things take time.
- Just a little longer.
- Let's get to work.

Diese Formulierungen bilden künftig den verbindlichen Sprachstil von OGG.

## Designprinzipien

1. **Funktion vor Dekoration:** Jedes Element braucht einen klaren Nutzen im Cockpit.
2. **Überblick vor Detail:** Die wichtigsten Daten müssen auf einen Blick erfassbar sein.
3. **Ruhe vor Bewegung:** Animationen erklären Zustandswechsel; sie dürfen nicht ablenken.
4. **Konsistenz vor Vielfalt:** Gleiche Zustände sehen und klingen überall gleich.
5. **Verlässlichkeit vor Spekulation:** Unsichere Daten werden als unbekannt gekennzeichnet.
6. **Persönlichkeit vor Effekten:** Charakter entsteht durch Wortwahl, Timing und Verhalten.
7. **Cockpit-Plausibilität:** Jede neue Funktion muss sich wie ein echter Bordcomputer anfühlen.

## Audio-Prinzipien

- Audio ergänzt die Anzeige und konkurriert nicht mit ihr.
- Eine Meldung wird nur gesprochen, wenn sie zeitlich relevant oder ohne Blick auf die UI nützlich ist.
- Navigation, Gefahr und betriebliche Zustände haben Vorrang vor atmosphärischen Kommentaren.
- Stimme, Tempo und Pausen bleiben ruhig und kontrolliert.
- Meldungen sind knapp; lange Erklärungen gehören in die UI.
- Gleiche Ereignisse dürfen nicht in schneller Folge dieselbe Ausgabe auslösen.
- Unterbrechungen und Prioritäten müssen vorhersehbar sein. Eine wichtige Navigations- oder Gefahrenmeldung darf eine beiläufige Bemerkung verdrängen.
- Audio muss deaktivierbar sein und darf die Bedienung nie blockieren.
- Sprachfassungen werden eigenständig und natürlich geschrieben, nicht mechanisch übersetzt.

## UI-Prinzipien

- Navigation hat Vorrang vor Animation.
- Aktuelles System, nächstes Ziel, Restdistanz, verbleibende Sprünge und relevante Sternklasse müssen unmittelbar erfassbar sein.
- Die visuelle Hierarchie folgt der Dringlichkeit und dem Flugkontext.
- Kritische Zustände verwenden nicht ausschließlich Farbe, sondern zusätzlich Text, Form oder Symbolik.
- Bewegungen sind selten, kurz und funktional. Daueranimationen sind zu vermeiden.
- Oberflächen bleiben auch bei fehlenden Journal- oder Netzwerkdaten verständlich.
- Fehlertexte sagen, was bekannt ist und welcher nächste Schritt möglich ist.
- Einstellungen erklären ihre Wirkung in der Sprache des Commanders, nicht in Implementierungsbegriffen.
- VR-taugliche Lesbarkeit – klare Typografie, starke Kontraste und großzügige Ziele – wird bei neuen Ansichten von Anfang an mitgedacht.

## Commander-Profile

### Standardprofil

- Das Standardprofil ist **Deutsch**.
- Es verwendet OGGs ruhigen, erfahrenen und trocken-humorvollen deutschen Sprachstil.
- Eine manuelle Sprachauswahl kann angeboten werden, sofern kein festes Commander-Profil greift.

### Commander Helitony

- Commander `Helitony` nutzt automatisch das englische Commander-Profil.
- Das Profil hat Vorrang vor der manuell gewählten Standardsprache.
- Die englischen Texte sind eigenständig natürlich formuliert und keine wörtlichen Übersetzungen deutscher Texte.
- Bestehende profilspezifische Begrüßungen, saisonale Inhalte und taktische Kommentare bewahren OGGs Kernpersönlichkeit.

### Profilregeln

- Commander-Profile verändern Sprache, Anrede und passende persönliche Nuancen, nicht OGGs Grundidentität.
- Profile werden deterministisch aus der bestätigten Commander-Identität gewählt.
- Fällt die Identität weg, gilt ein sicherer und neutraler Standard statt einer geratenen Zuordnung.
- Neue Profile benötigen einen klaren Produktgrund und getestete Aktivierungsregeln.

## Technische Grundsätze

- Lokale, verifizierbare Spieldaten haben Vorrang vor externen Annahmen.
- Eine fachliche Information besitzt eine zentrale Quelle; UI und Audio leiten sich daraus ab.
- Unsicherheit wird im Datenmodell erhalten und nicht durch Schätzungen verdeckt.
- Frontend, Rust-Backend und Voice-Sidecar haben klar getrennte Verantwortlichkeiten.
- Start, Beenden, Updates und Sidecar-Lebenszyklus müssen fehlertolerant und nachvollziehbar sein.
- Kernfunktionen sollen ohne dauerhafte Cloud-Abhängigkeit arbeiten.
- Datenschutz folgt dem Prinzip der Datensparsamkeit; lokale Daten bleiben soweit möglich lokal.
- Lokalisierung bedeutet natürliche, profilspezifische Formulierung und nicht bloßen Zeichenkettenaustausch.

## Entwicklungsgrundsätze

- Jede Änderung beginnt mit dem Nutzen für den Commander und einem konkreten Cockpit-Szenario.
- Neue Funktionen werden gegen Identität, Informationshierarchie und Störpotenzial geprüft.
- Verhalten mit Folgen für Navigation, Profile, Updates oder Audio wird automatisiert getestet.
- Fehlerzustände und fehlende Daten gehören zum normalen Entwurf, nicht zur späteren Nacharbeit.
- Bestehende Entscheidungen werden nur mit dokumentiertem Grund geändert.
- Abgeschlossene Arbeitspakete aktualisieren `OGG_Project_Log.md`; Zukunftspläne werden ausschließlich in `OGG_ROADMAP.md` gepflegt.
- Versionsangaben und Release-Artefakte bleiben synchron und reproduzierbar.
- Ein Feature ist erst fertig, wenn Text, Audio, UI, Fehlerfall und Profilverhalten zusammenpassen.
- Nach jeder erfolgreichen Änderung werden Frontend, Rust-Release und Python-Sidecar gebaut, NSIS und MSI erzeugt, der NSIS-Build lokal installiert und die installierte Version per Sichtprüfung gestartet. Anschließend werden alle OGG-Prozesse sauber beendet; die lokale Installation entspricht damit stets dem aktuellen Entwicklungsstand.
- Lokal installierte Entwicklungs- und Codex-Test-Builds werden eindeutig als lokale Builds gekennzeichnet und führen keine automatische GitHub-Updateprüfung für reguläre Benutzer-Releases aus.

## Langfristige Vision

OGG soll sich wie der vertraute Bordcomputer eines langjährig geflogenen Schiffs anfühlen: im Alltag unaufdringlich, bei Navigation und Exploration vorausschauend und im entscheidenden Moment zuverlässig. Mit wachsender Funktionalität darf OGG nicht lauter oder beliebiger werden. Er soll besser verstehen, welche Information jetzt zählt, und alles andere mit der Ruhe eines Veteranen behandeln.

Das Ziel ist kein künstlicher Gesprächspartner, sondern ein glaubwürdiges Cockpitsystem mit Charakter – wiedererkennbar in jeder Ansicht, jeder Meldung und jeder Sprache.
