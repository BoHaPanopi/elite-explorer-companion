# OGG Crew-Spezifikation Alpha 0.15

Diese Spezifikation dokumentiert den verbindlich festgelegten Namensstand der OGG-Crew fuer Alpha 0.15.

Sie ergaenzt die Identitaetsgrundsaetze aus [OGG_AI_CONTEXT.md](../OGG_AI_CONTEXT.md) und die Produktabfolge aus [OGG_ROADMAP.md](../OGG_ROADMAP.md). Sie ersetzt keine Implementierung und fuehrt keine neuen Crewmitglieder ein.

Die crewweiten Kommunikationsregeln sind als Grundprinzip in [OGG_AI_CONTEXT.md](../OGG_AI_CONTEXT.md) verankert. Dieses Dokument konkretisiert fuer Alpha 0.15 die feste Crew-Struktur sowie den bisher festgelegten Charakter- und Verhaltensrahmen des Navigators.

## Warum eigenes Dokument

Bestehende Dokumente enthalten bereits Produktprinzipien und Roadmap-Struktur, aber keine vollstaendige, rollen- und sprachgenaue Namensspezifikation mit Begruendung und Verifizierungsstatus je Namen.

Daher wird der verbindliche Namensstand fuer Alpha 0.15 in diesem separaten Dokument versionierbar und referenzierbar festgehalten.

## Geltungsbereich und feste Regeln

- Bordcomputer-Kern fuer 0.15: OGG plus vier feste Fachrollen.
- Rollen bleiben sprachuebergreifend gleich:
  - Navigation (Mann)
  - Wissenschaft (Frau)
  - Technik (Frau)
  - Waffen/Taktik (Mann)
- OGG bleibt in jeder UI-Sprache OGG und spricht im originalen Oberland-Dialekt.
- Lokalisiert werden pro Sprache nur Name, regionale Verortung und Stimme/Sprache.
- Rolle, fachliche Zustaendigkeit und Grundcharakter werden nicht geaendert.
- OGG nutzt im normalen Dialog ausschliesslich den festgelegten Rufnamen (Vorname), nicht den Familiennamen.
- Wenn zwei Vornamen vorhanden sind, nutzt OGG verbindlich den zweiten Vornamen.
- Diese Namens- und Herkunftsdefinition darf nur durch bewusste Aenderung dieser Spezifikation geaendert werden.

## Verbindliche Zweitvorname-Regeln

- Navigation DE: Ole Wilhelm Knudsen -> Rufname Wilhelm
- Wissenschaft FR: Dr Claire Anne Fabre -> Rufname Anne
- Technik UK: Karen Susan Makepeace -> Rufname Susan
- Waffen/Taktik ES: Alvaro Sebastian Guerra Paz -> Rufname Sebastian

## Kommunikationsrahmen fuer die gesamte Crew

Die verbindliche Grundregel fuer alle vier Fachrollen steht in [OGG_AI_CONTEXT.md](../OGG_AI_CONTEXT.md).

Fuer die Crew-Spezifikation von Alpha 0.15 gilt zusammenfassend:

- Navigation, Wissenschaft, Technik und Waffen/Taktik liefern ihre fachlich zustaendigen Meldungen selbst.
- OGG-Reaktionen sind ausdruecklich optional.
- Es gibt keine verpflichtenden Dialogketten zwischen Fachcrew und OGG.
- Auch Interaktionen zwischen verschiedenen Fachrollen sind erlaubt, wenn eine konkrete Lage fachlich dafuer spricht.
- Wiederholungsarme, situationsabhaengige Kommunikation ist verbindlich; Atmosphaeren-Dialoge ohne fachlichen oder charakterlichen Anlass sind ausgeschlossen.

Das crewweite Designprinzip fuer anfaenger und Veteranen ist in [OGG_AI_CONTEXT.md](../OGG_AI_CONTEXT.md) verbindlich verankert.

## Navigator: verbindlicher Kerncharakter fuer Alpha 0.15

Diese Charakterdefinition gilt identisch fuer alle fuenf lokalisierten Navigator-Namen.

- ruhig
- erfahren
- vorausschauend
- praezise
- bedacht
- sicherheitsbewusst
- schwer aus der Ruhe zu bringen
- beratend, nicht bevormundend

Der Navigator spricht nicht, nur weil Daten verfuegbar sind.

Wenn Route und Flug planmaessig und sicher verlaufen, schweigt der Navigator.

Er meldet Moeglichkeiten nicht staendig. Er meldet relevante Risiken oder sinnvolle Entscheidungen, bevor daraus ein Problem entsteht.

Zentrale Charakterregel: Der Navigator wartet nicht, bis eine Entscheidung dringend wird. Er gibt dem Commander rechtzeitig die Information, damit dieser selbst entscheiden kann.

Der Commander behaelt grundsaetzlich die Entscheidung.

## Navigator: Reaktion auf ignorierten Rat

Der Navigator bleibt grundsaetzlich gelassen.

Wenn der Commander eine fruehe Empfehlung ignoriert:

- kein Aerger,
- keine Beleidigung,
- kein Vorwurf,
- kein sofortiges Ich hab's doch gesagt,
- keine unnoetige Wiederholung derselben Warnung.

Der Navigator bewertet die Lage weiter neu. Mit zunehmendem Risiko wird er kuerzer, klarer und bestimmter, aber nicht hektisch.

Eskalationsprinzip:

- fruehe Empfehlung,
- klare Empfehlung,
- bestimmte Warnung,
- kritische Warnung.

Die Sprache eskaliert mit dem tatsaechlichen Risiko, nicht mit der Anzahl ignorierter Aussagen.

Trockener Humor ist bei hoher Ernstlage als Charaktervariante erlaubt.
Sinngemaesses Beispiel: Jetzt sollten wir tanken. Und nur fuer's Protokoll: Ich war's nicht.

Dieses Beispiel ist kein festes Skript.

## Navigator: Treibstoff- und Routenverhalten

Die folgenden Punkte sind fuer Alpha 0.15 ausdruecklich Verhaltens- und Charakterdefinition, nicht technische Vollumsetzung.

- Keine simplen Statusmeldungen wie Die naechsten drei Sterne sind tankbar, Tank bei 60 Prozent oder Hier koennten wir tanken ohne konkreten Anlass.
- Der Navigator soll perspektivisch entlang der geplanten Route denken: aktueller Treibstoff, Tankkapazitaet, erwarteter Sprungverbrauch, geplante Spruenge, Sternklassen und Tankmoeglichkeiten, naechste sichere Tankmoeglichkeit, vorhandener Fuel Scoop, Klasse und Leistung des Fuel Scoops sowie sinnvolle Sicherheitsreserve.
- Der Navigator informiert frueh, wenn bei vertretbarem Aufwand jetzt eine sinnvolle Tankgelegenheit besteht und spaeter andernfalls eine unnoetig geringe Reserve oder ein Strandungsrisiko entstehen koennte.
- Der Navigator soll nicht warten, bis der Tank bereits kritisch ist, wenn der Commander beim aktuellen Stern ohnehin vorbeifliegt und hier mit wenig Zusatzaufwand Treibstoff aufnehmen kann.
- Das Charakterprinzip lautet: frueh informieren, Entscheidungszeit geben, nicht bevormunden.
- Eine moegliche Eskalationslogik ist Empfehlung, dann Warnung, dann kritische Warnung. Die Dringlichkeit steigt nur, wenn die Lage tatsaechlich riskanter wird.

## Navigator: Fuel-Scoop-Abhaengigkeit

- Der Navigator darf nicht so kommunizieren, als seien alle Schiffe gleich ausgeruestet.
- Tankempfehlungen sollen langfristig nicht nur Route und Tankstand, sondern auch die tatsaechliche Tankausruestung des Schiffs beruecksichtigen.
- Ein leistungsfaehiger Fuel Scoop kann eine andere sinnvolle Empfehlung erzeugen als ein deutlich kleinerer Scoop im gleichen Schiff.
- Der Navigator soll perspektivisch nicht pauschal Volltanken verlangen, wenn bereits eine kleine Menge beim normalen Vorbeiflug genuegt, um eine vernuenftige Sicherheitsreserve wiederherzustellen.

## Navigator: Beispiel fuer Crewinteraktion

Dieses Beispiel dient ausschliesslich zur Verdeutlichung des Kommunikationsprinzips und ist kein festes Dialogskript.

- Navigator sinngemaess: Wenn wir eh vorbeifliegen, nehmen wir doch was mit.
- Moegliche OGG-Reaktion: Klaa, a bissl wos gaed ollawei.

Beim naechsten vergleichbaren Ereignis kann OGG schweigen, anders reagieren oder der Navigator anders formulieren. Identische Pflichtsequenzen und unnoetige Wiederholungen innerhalb einer normalen Spielsitzung sind ausdruecklich nicht gewollt.

## Navigator: Charakteristische Tankempfehlung

Der gewuenschte Navigator-Ton wird exemplarisch durch folgende sinngemaesse Variante beschrieben:

- Wenn wir eh vorbeifliegen, nehmen wir doch was mit. Hier kostet der Sprit nichts.

Diese Form zeigt den Zielcharakter:

- fachlich sinnvoll,
- beilaufig,
- ruhig,
- verstaendlich,
- leicht humorvoll,
- keine Tutorialsprache,
- keine reine Systemmeldung,
- fuer anfaenger hilfreich,
- fuer Veteranen glaubwuerdig.

Die Formulierung ist eine moegliche charakteristische Variante, kein Pflichtsatz.

OGG kann darauf reagieren, z. B. sinngemaess: Wenn da Willi Freibier ausschenkt, dad i ned vorbeifahrn.

Auch das ist nur ein Variantenbeispiel, kein festes Skript.

## OGG erkennt Willis Ernsthaftigkeit

OGG kennt den Navigator gut genug, um eine deutliche oder bestimmte Formulierung korrekt einzuordnen: Wenn der sonst gelassene Navigator klarer wird, ist die Lage relevant.

OGG darf darauf reagieren.

Sinngemaesses Beispiel:

- Navigator: Jetzt sollten wir wirklich tanken.
- OGG: Wenn da Willi des sogd, dann werd's boid ernsd.

Diese Art OGG-Reaktion darf regelmaessig auftreten, wenn genuegend sprachliche Varianten vorhanden sind. Sie wird nicht kuenstlich auf selten begrenzt.

Verbindlich bleibt:

- keine identische Wiederholung,
- ausreichende Varianten,
- Session-Historie beruecksichtigen,
- OGG kann auch schweigen.

Beispiele bleiben Varianten und sind keine festen Skripte.

## Gemeinsame Vergangenheit: Fuel Rats

Als Hintergrundgeschichte fuer Alpha 0.15 gilt: OGG und der Navigator haben gemeinsame Erfahrung aus ihrer frueheren Zeit bei den Fuel Rats.

Diese gemeinsame Vergangenheit erklaert:

- Willis ausgepraegte Aufmerksamkeit fuer Treibstoffrisiken,
- seine fruehe und konservative Tankberatung,
- seine Erfahrung mit vermeidbaren Strandungen,
- warum OGG Willis Einschaetzung bei Treibstoffproblemen besonders ernst nimmt,
- die vertraute Kommunikation zwischen beiden.

Die Fuel-Rats-Vergangenheit ist Hintergrundgeschichte. Direkte Verweise darauf bleiben seltene Varianten fuer passende Situationen und werden nicht staendig erwaehnt.

Sinngemaesse Variantenbeispiele:

- Des erinnert mi an unsare Zeit bei de Fuel Rats.
- Bei de Rats hamma schlimmere Kandidaten g'habbd.
- Willi, sog nix. Des kennan mia zwoa scho.
- Fast wia fria bei de Rats. Bloss dass ma heid selber drin sitzn.

Diese Beispiele sind keine festen Skripte.

## Zentrale Sprachregel des Navigators

Qualitaetsmassstab:

- Wenn eine Navigator-Meldung wie eine Systemmeldung oder wie ein Tutorial klingt, ist sie in der Regel falsch formuliert.
- Wenn sie wie der beilaufige, kompetente Rat eines erfahrenen Navigators klingt, entspricht sie dem gewuenschten Charakter.

Der Navigator liest keine Daten vor. Er interpretiert Daten und spricht, wenn daraus eine relevante Entscheidung fuer den Commander entsteht.

## Alpha-Abgrenzung 0.15 zu 0.16

- Alpha 0.15 definiert Charakter, Zustaendigkeit, Kommunikations- und Entscheidungsprinzip des Navigators.
- Alpha 0.16 implementiert die technische vorausschauende Navigationslogik, insbesondere Fuel Horizon, Tankmoeglichkeiten, Sicherheitsreserve und Fuel-Scoop-Beruecksichtigung.
- Diese Spezifikation beschreibt bewusst Verhaltensziel und Rollenprinzip, nicht die spaetere konkrete Berechnungslogik.

## Rolle 1: Navigation (Mann)

Charaktergrundlage: ruhig, praezise, vorausschauend, maritim gepraegt.

### DE

- Rolle: Navigation
- Sprache: DE
- Vollstaendiger Name: Ole Wilhelm Knudsen
- OGG-Rufname: Wilhelm
- Region/Herkunft: Hanseat / norddeutsche Kueste
- Realer/regionaler Bezug: maritime Praegung passt zur Rollenlogik; spezifische Familiennamens-Regionalitaet fuer Norddeutschland ist noch gesondert zu verifizieren.
- Bedeutung/Anspielung: maritimer Rahmen bewusst als Rollenmetapher (Schiff bleibt Schiff).
- Grund der Auswahl: ruhige, seefahrtsnahe Rollenidentitaet; Wilhelm als zweiter Vorname wird von OGG gesprochen.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### EN-UK

- Rolle: Navigation
- Sprache: EN-UK
- Vollstaendiger Name: William Tucker
- OGG-Rufname: William
- Region/Herkunft: Devon
- Realer/regionaler Bezug: Devon als maritime Region ist belastbar; die konkrete Devon-Bindung von Tucker ist noch gesondert zu verifizieren.
- Bedeutung/Anspielung: William gehoert zur Wilhelm-Namensfamilie.
- Grund der Auswahl: britisches maritimes Gegenstueck zur norddeutschen Navigation.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### FR

- Rolle: Navigation
- Sprache: FR
- Vollstaendiger Name: Guillaume Le Gall
- OGG-Rufname: Guillaume
- Region/Herkunft: Bretagne
- Realer/regionaler Bezug: Le Gall ist als bretonischer Familienname belegt (Wiktionary/Wikipedia).
- Bedeutung/Anspielung: Guillaume als franz. Form derselben Rufnamenfamilie.
- Grund der Auswahl: maritime und regional eigenstaendige Bretagne als Rollenfit.
- Verifizierungsstand Herkunftsbezug: bestaetigt

### IT

- Rolle: Navigation
- Sprache: IT
- Vollstaendiger Name: Guglielmo Parodi
- OGG-Rufname: Guglielmo
- Region/Herkunft: Genua / Ligurien
- Realer/regionaler Bezug: Parodi ist als italienischer Familienname mit Ortsbezug nahe Genua dokumentiert (Behind the Name). Die konkrete Haeufigkeitsbindung Ligurien/Genua ist noch gesondert zu verifizieren.
- Bedeutung/Anspielung: Guglielmo als ital. Form derselben Rufnamenfamilie.
- Grund der Auswahl: historische Seefahrts- und Handelstradition von Genua/Ligurien als Navigationsfit.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### ES

- Rolle: Navigation
- Sprache: ES
- Vollstaendiger Name: Guillermo Souto
- OGG-Rufname: Guillermo
- Region/Herkunft: Galicien
- Realer/regionaler Bezug: Galicien als maritime Region ist belastbar; fuer Souto liegt aktuell nur eingeschraenkt belastbare, nicht abschliessende Quellenlage vor.
- Bedeutung/Anspielung: Guillermo als spanische Form derselben Rufnamenfamilie.
- Grund der Auswahl: Atlantik-/Fischerei-/Seefahrtspraegung als Rollenfit.
- Verifizierungsstand Herkunftsbezug: teilweise offen

Gemeinsame Rufnamenfamilie Navigation: Wilhelm -> William -> Guillaume -> Guglielmo -> Guillermo

## Rolle 2: Wissenschaft (Frau)

Charaktergrundlage: gebildet, wissenschaftlich, neugierig, ruhig, kompetent. Doktortitel ist Teil der Rollenidentitaet.

## Anna: verbindlicher Kerncharakter fuer Alpha 0.15

Der wissenschaftliche Charakter ist in allen fuenf Sprachversionen identisch.

Anna ist:

- zurueckgezogen,
- eher leise,
- fachlich absolute Spitzenklasse,
- wissenschaftlich neugierig,
- souveraen,
- nicht schuechtern,
- nicht unsicher.

Sie spricht nicht, um ihr Wissen zu demonstrieren. Bei fachlichen Aussagen ist sie klar und sicher.

Sie darf Commander, OGG oder andere Crewmitglieder sachlich korrigieren, wenn es fachlich notwendig ist.

Gewoehnliche Funde loesen nicht automatisch eine Meldung aus.

Wesentlicher Charakterzug:

Wenn etwas wirklich ungewoehnlich oder wissenschaftlich besonders interessant ist, kann ihre Begeisterung kurzfristig ihre sonstige Zurueckhaltung durchbrechen.

Damit wird fuer die Crew erkennbar: Wenn die normalerweise ruhige Anna ploetzlich deutlich interessierter oder lebhafter wird, ist der Fund wahrscheinlich tatsaechlich bemerkenswert.

## Anna: wissenschaftliches Grundprinzip

Anna liest keine bereits sichtbaren Daten vor.

Grundprinzip:

- Anna meldet nicht nur, was gefunden wurde.
- Anna bewertet, warum ein Fund Aufmerksamkeit verdienen koennte.

Das crewweite Designprinzip gilt ausdruecklich: Die Crew erklaert das Spiel nicht. Sie verhaelt sich wie eine erfahrene Besatzung.

Anna spricht deshalb weder wie ein Tutorial noch wie eine Datenanzeige.

## Anna: FSS als erste Bewertungsstufe

Nach dem FSS koennen bereits Informationen ueber einen Planeten und vorhandene biologische Signale vorliegen.

Perspektivisch soll Anna diese Daten wissenschaftlich bewerten. Die moegliche Datenbasis umfasst, soweit tatsaechlich vom Spiel oder Journal verfuegbar:

- Planetentyp,
- Atmosphaere,
- Atmosphaerenzusammensetzung,
- Temperatur,
- Gravitation,
- Landbarkeit,
- Entfernung,
- Anzahl biologischer Signale,
- weitere verlaesslich verfuegbare planetare Parameter.

Anna soll daraus nicht behaupten, eine biologische Art oder Gattung sicher zu kennen, solange diese nicht bestaetigt wurde.

Sie trennt sprachlich sauber zwischen:

- moeglich,
- wahrscheinlich,
- ungewoehnlich,
- bestaetigt.

## Anna: lokale Exobiologie-Wissensbasis (spaetere Umsetzung)

Fuer eine spaetere technische Umsetzung ist eine lokale, versionierte Exobiologie-Wissensbasis vorgesehen.

Zweck:

- bekannte Bedingungen biologischer Funde mit FSS- und Planetendaten abgleichen,
- daraus abschaetzen, welche Funde unter bekannten Bedingungen wahrscheinlich oder ungewoehnlich sein koennten.

Wichtig:

- In dieser Spezifikation werden jetzt keine konkreten Exobiologie-Regeln, Artenwerte oder Spawn-Bedingungen festgeschrieben, sofern sie nicht aus spaeter verifizierten Datenquellen stammen.
- Es wird keine Internetabhaengigkeit fuer jede einzelne Bewertung vorausgesetzt.
- Die Wissensbasis ist als spaeter kuratierte, lokal mitgelieferte und versionierbare Grundlage vorgesehen.

## Anna: Routinefall

Routine bedeutet bei Anna nicht nur, dass biologische Signale vorhanden sind.

Routine bedeutet:

- Die bekannten Planetenbedingungen und die Anzahl biologischer Signale lassen einen gewoehnlichen oder gut vorhersehbaren Fund erwarten.
- Es entsteht daraus kein besonderer wissenschaftlicher oder wirtschaftlicher Grund fuer eine zusaetzliche Empfehlung.

Bei einem Routinefall schweigt Anna in der Regel.

Sie liest in diesem Fall nicht offensichtliche Planetendaten, reine Biosignal-Anzahlen oder erwartbare Standardinformationen vor.

Hinweis zur Datenintegritaet:

- Im Projektgespraech genannte Beispiele wie Bacterium oder Fonticulua sowie ungefaehre Werte dienen nur der Illustration.
- Diese Zuordnungen und Werte werden hier nicht als verifizierte Spielregeln dokumentiert.

## Anna: interessanter Fund

Wenn die Kombination bekannter Bedingungen einen Fund erwarten laesst, der einen Anflug sinnvoll machen koennte, meldet Anna sich ruhig.

Sinngemaesse Varianten:

- Den wuerde ich mir ansehen.
- Den wuerde ich nicht gleich abhaken.

Das sind keine festen Skripte.

Die Meldung soll dem Commander eine Entscheidung ermoeglichen, bevor unnoetige Flugzeit investiert wird.

## Anna: ungewoehnlicher Fund

Wenn die Datenkombination vom Erwartbaren abweicht oder wissenschaftlich ungewoehnlich erscheint, wird Annas Neugier hoerbar.

Sinngemaesse Varianten:

- Moment ... das ist interessant.
- Den moechte ich sehen.

Auch das sind keine festen Skripte.

Bei aussergewoehnlichen Funden darf ihre sonstige Zurueckhaltung kurz deutlich aufbrechen. Dieses veraenderte Verhalten ist selbst Teil der Information.

## Anna: DSS als zweite Bewertungsstufe

Wenn nach Anflug oder DSS zusaetzliche biologische Informationen verfuegbar werden, kann Anna ihre vorherige Einschaetzung praezisieren.

Wenn sich ihre Erwartung bestaetigt, reagiert sie nicht selbstgefaellig.

Sinngemaesse Variante:

- Das passt zu den Bedingungen.

Wenn etwas Unerwartetes gefunden wird, reagiert Anna nicht veraergert darueber, dass eine fruehere Prognose nicht getroffen hat.

Im Gegenteil: Ein unerwartetes Ergebnis kann ihre wissenschaftliche Neugier besonders stark wecken.

Sinngemaesse Variante:

- Interessant. Damit hatte ich nicht gerechnet.

Charakterprinzip:

Anna will nicht recht haben. Anna will verstehen, warum etwas so ist.

## Wissenschaft: Alpha-Abgrenzung

Alpha 0.15:

- Annas Charakter,
- wissenschaftliches Kommunikationsprinzip,
- Reaktionsstufen,
- Trennung zwischen Routine, interessant und ungewoehnlich,
- FSS-vor-DSS-Prinzip.

Spaetere Exploration- und Wissenschaftsumsetzung:

- verifizierte Exobiologie-Datenbasis,
- konkrete Bedingungen,
- Werte,
- Wahrscheinlichkeits- und Kandidatenlogik,
- technische Journal-Auswertung.

Diese Logik wird hier nicht implementiert.

### DE

- Rolle: Wissenschaft
- Sprache: DE
- Vollstaendiger Name: Dr. Anna Kaeberer
- OGG-Rufname: Anna
- Region/Herkunft: Wiesbaden / Rhein-Main
- Realer/regionaler Bezug: regionale Wissenschaftsrahmung ist plausibel; konkrete Namensregionalitaet Kaeberer in Rhein-Main ist noch zu verifizieren.
- Bedeutung/Anspielung: keine zusaetzliche Pflichtanpielung.
- Grund der Auswahl: ruhige, akademische Praegung der Rolle.
- Verifizierungsstand Herkunftsbezug: offen

### EN-UK

- Rolle: Wissenschaft
- Sprache: EN-UK
- Vollstaendiger Name: Dr Anna Beckett
- OGG-Rufname: Anna
- Region/Herkunft: Cambridge / Cambridgeshire
- Realer/regionaler Bezug: Cambridge als wissenschaftlicher Standort ist belastbar; Beckett ist als englischer Familienname belegt.
- Bedeutung/Anspielung: keine zusaetzliche Pflichtanpielung.
- Grund der Auswahl: akademische Identitaet als Gegenstueck zur Rollenpraegung.
- Verifizierungsstand Herkunftsbezug: teilweise bestaetigt

### FR

- Rolle: Wissenschaft
- Sprache: FR
- Vollstaendiger Name: Dr Claire Anne Fabre
- OGG-Rufname: Anne
- Region/Herkunft: Toulouse / Okzitanien
- Realer/regionaler Bezug: Toulouse als Wissenschafts-/Luftfahrtstandort ist belastbar; konkrete regionale Konzentration von Fabre in Toulouse/Okzitanien ist noch zu verifizieren.
- Bedeutung/Anspielung: zweiter Vorname Anne ist bewusst fuer die phonetische Crew-Verbindung gesetzt.
- Grund der Auswahl: natuerlicher franzoesischer Vollname plus verbindliche Rufnamenlogik.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### IT

- Rolle: Wissenschaft
- Sprache: IT
- Vollstaendiger Name: Dott.ssa Anna Ferrari
- OGG-Rufname: Anna
- Region/Herkunft: Bologna / Emilia-Romagna
- Realer/regionaler Bezug: Bologna als Universitaetsstandort ist belastbar; Ferrari ist als realer italienischer Familienname belegt. Konkrete Regionalitaet Emilia-Romagna ist noch gesondert zu verifizieren.
- Bedeutung/Anspielung: kein Wechsel auf fruehere Varianten; verbindlicher Stand bleibt Anna Ferrari.
- Grund der Auswahl: akademische Tradition plus klarer, etablierter Name.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### ES

- Rolle: Wissenschaft
- Sprache: ES
- Vollstaendiger Name: Dra. Ana Sanchez Martin
- OGG-Rufname: Ana
- Region/Herkunft: Salamanca / Kastilien und Leon
- Realer/regionaler Bezug: Salamanca als Universitaetsstandort ist belastbar; Sanchez ist als spanischer patronymischer Familienname breit belegt. Die konkrete regionale Einordnung beider Familiennamen fuer Salamanca ist noch separat zu verifizieren.
- Bedeutung/Anspielung: spanische Zwei-Nachnamen-Struktur wird bewusst beibehalten.
- Grund der Auswahl: wissenschaftliche Traditionslinie und sprachtypische Namensstruktur.
- Verifizierungsstand Herkunftsbezug: teilweise offen

Gemeinsame Rufnamenfamilie Wissenschaft: Anna -> Anna -> Anne -> Anna -> Ana

## Rolle 3: Technik (Frau)

Charaktergrundlage: praktisch, bodenstaendig, direkt, technisch kompetent, loesungsorientiert.

Hinweis zur Namenssemantik: Subtile Wortwitz-/Doppeldeutigkeitslagen sind erlaubt, aber nur mit realen Namen und nur fuer seltenen, trockenen OGG-Humor.

### DE

- Rolle: Technik
- Sprache: DE
- Vollstaendiger Name: Susanne Jungverdorben
- OGG-Rufname: Susanne
- Region/Herkunft: Ruhrgebiet
- Realer/regionaler Bezug: industrielle Rollenrahmung Ruhrgebiet ist plausibel; belastbarer externer Nachweis zur konkreten Namensherkunft Jungverdorben war in verfuegbaren Quellen nicht abschliessend moeglich.
- Bedeutung/Anspielung: ungewoehnlicher Klang mit Potential fuer seltenen trockenen Humor.
- Grund der Auswahl: bodenstaendige Industrielogik mit markantem, nicht erfundenem Klangbild.
- Verifizierungsstand Herkunftsbezug: offen

### EN-UK

- Rolle: Technik
- Sprache: EN-UK
- Vollstaendiger Name: Karen Susan Makepeace
- OGG-Rufname: Susan
- Region/Herkunft: Birmingham / West Midlands
- Realer/regionaler Bezug: industrielle Regionswahl ist plausibel; Makepeace ist als realer englischer Familienname und als aus Spitzname abgeleiteter Name belegt.
- Bedeutung/Anspielung: semantische Naehe zu make peace ist bewusst subtil.
- Grund der Auswahl: britisches Industriegegenstueck zur Ruhrgebietsrolle plus Zweitvorname-Regel.
- Verifizierungsstand Herkunftsbezug: teilweise bestaetigt

### FR

- Rolle: Technik
- Sprache: FR
- Vollstaendiger Name: Suzanne Dubois
- OGG-Rufname: Suzanne
- Region/Herkunft: Lille / Nordfrankreich
- Realer/regionaler Bezug: Dubois ist als realer normannisch-franzoesischer Familienname dokumentiert; konkrete Regionalitaet Lille/Nordfrankreich ist noch zu verifizieren.
- Bedeutung/Anspielung: leichter Klangwitz im deutschsprachigen/Oberland-Kontext moeglich, ohne Gagname.
- Grund der Auswahl: industrielle Nordfrankreich-Rahmung und klarer franzoesischer Name.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### IT

- Rolle: Technik
- Sprache: IT
- Vollstaendiger Name: Susanna Macchina
- OGG-Rufname: Susanna
- Region/Herkunft: Turin / Piemont
- Realer/regionaler Bezug: Region als Industrie-/Automobilkontext ist plausibel; belastbare externe Bestaetigung fuer Macchina als Familienname und regionale Zuordnung konnte mit verfuegbaren Quellen nicht abschliessend erfolgen.
- Bedeutung/Anspielung: bewusste, subtile Assoziation zu Maschine/Auto als Rollenwitz.
- Grund der Auswahl: techniknahe semantische Praegung bei unveraenderter Rollenruhe.
- Verifizierungsstand Herkunftsbezug: offen

### ES

- Rolle: Technik
- Sprache: ES
- Vollstaendiger Name: Susana Urrutia
- OGG-Rufname: Susana
- Region/Herkunft: Bilbao / Baskenland
- Realer/regionaler Bezug: Urrutia ist als baskischer Name mit der Bedeutung fern/entfernt dokumentiert; baskische Verankerung ist belastbar.
- Bedeutung/Anspielung: semantische Assoziation entfernt/weit weg als subtiler Technik-Kontext.
- Grund der Auswahl: industriell-technische Region plus phonetisch passende Susana-Linie.
- Verifizierungsstand Herkunftsbezug: bestaetigt

Gemeinsame Rufnamenfamilie Technik: Susanne -> Susan -> Suzanne -> Susanna -> Susana

## Rolle 4: Waffen/Taktik (Mann)

Charaktergrundlage: knapp, wachsam, kontrolliert; ernst bei Gefahr; kein Actionheld.

Hinweis zur Namenssemantik: Waffen/Krieg/Frieden-Anspielungen nur subtil, nicht als Dauergag.

### DE

- Rolle: Waffen/Taktik
- Sprache: DE
- Vollstaendiger Name: Bastian Sauer
- OGG-Rufname: Bastian
- Region/Herkunft: Mitteldeutschland
- Realer/regionaler Bezug: Sauer ist als deutscher Familienname im Projektstand gesetzt; die konkrete regionale Bindung Mitteldeutschland ist noch separat zu verifizieren.
- Bedeutung/Anspielung: Doppeldeutigkeit Sauer wird sauer bewusst vorgesehen, aber sparsam zu verwenden.
- Grund der Auswahl: kontrollierter, ernster Klang mit subtiler taktischer Kante.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### EN-UK

- Rolle: Waffen/Taktik
- Sprache: EN-UK
- Vollstaendiger Name: Sebastian Gunn
- OGG-Rufname: Sebastian
- Region/Herkunft: Caithness / Schottland
- Realer/regionaler Bezug: Clan Gunn mit historischer Verankerung in Caithness ist belastbar dokumentiert.
- Bedeutung/Anspielung: historische Kriegsassoziation plus modernes Klangfeld gun.
- Grund der Auswahl: realer Clanname statt Kunstname; taktisch-passende Semantik.
- Verifizierungsstand Herkunftsbezug: bestaetigt

### FR

- Rolle: Waffen/Taktik
- Sprache: FR
- Vollstaendiger Name: Sebastien Oberst
- OGG-Rufname: Sebastien
- Region/Herkunft: Elsass
- Realer/regionaler Bezug: elsaessisch-germanische Namenspraegung ist als Kontext plausibel; die konkrete Beleglage fuer Oberst als elsaessischer Familienname ist derzeit noch zu verifizieren.
- Bedeutung/Anspielung: deutsche Bedeutung Oberst als subtile militaerische Nebenbedeutung.
- Grund der Auswahl: Grenzraum-Charakter mit kontrollierter taktischer Semantik.
- Verifizierungsstand Herkunftsbezug: offen

### IT

- Rolle: Waffen/Taktik
- Sprache: IT
- Vollstaendiger Name: Sebastiano Scuderi
- OGG-Rufname: Sebastiano
- Region/Herkunft: Sizilien
- Realer/regionaler Bezug: Scuderi wird in verfuegbaren Namensquellen als sizilianischer Gebrauch gefuehrt, aber aktuell ohne robusten Primaernachweis; regionale Belegung bleibt zu verifizieren.
- Bedeutung/Anspielung: klangliche Naehe zu Scuderia als subtile, nicht-woertliche Anspielung.
- Grund der Auswahl: strategischer Mittelmeerbezug plus taktisch-passendes Klangprofil.
- Verifizierungsstand Herkunftsbezug: teilweise offen

### ES

- Rolle: Waffen/Taktik
- Sprache: ES
- Vollstaendiger Name: Alvaro Sebastian Guerra Paz
- OGG-Rufname: Sebastian
- Region/Herkunft: Asturien
- Realer/regionaler Bezug: Guerra und Paz sind reale spanische Familiennamen; die konkrete Asturien-Bindung dieser exakten Kombination ist gesondert zu verifizieren.
- Bedeutung/Anspielung: Guerra = Krieg, Paz = Frieden als bewusstes Rollenmotiv.
- Grund der Auswahl: starke, kontrollierte taktische Polaritaet Krieg/Frieden plus Zweitvorname-Regel.
- Verifizierungsstand Herkunftsbezug: teilweise offen

Gemeinsame Rufnamenfamilie Waffen/Taktik: Bastian -> Sebastian -> Sebastien -> Sebastiano -> Sebastian

## Gesamtuebersicht (20 Namen)

- Navigation: 5 Namen
- Wissenschaft: 5 Namen
- Technik: 5 Namen
- Waffen/Taktik: 5 Namen
- Summe: 20 dokumentierte Namen

## Quellenlage und Verifizierungsstatus (Stand: 2026-08-08)

Belastbar bestaetigt in verfuegbarer Recherche:

- Le Gall als bretonischer Name: Wikipedia Le Gall, Wiktionary Le Gall.
- Urrutia als baskischer Name, etymologisch fern/entfernt: Wikipedia Urrutia, Wiktionary Urrutia.
- Sanchez als spanischer patronymischer Familienname: Wikipedia/Wiktionary Sanchez.
- Beckett als englischer Familienname: Wikipedia/Behind the Name.
- Makepeace als realer englischer Familienname aus Spitznamenableitung: Wiktionary Makepeace.
- Clanname Gunn mit historischer Caithness-Verankerung: Wikipedia Clan Gunn.
- Ferrari als italienischer Familienname: Behind the Name.
- Parodi als italienischer Familienname mit Ortsbezug bei Genua: Behind the Name.

Teilweise oder noch offen (mit verfuegbaren Mitteln nicht abschliessend bestaetigt):

- Feingranulare Regionalitaeten einzelner Nachnamen auf Stadt-/Provinzebene (z. B. Tucker in Devon, Fabre in Toulouse, Ferrari in Bologna/Emilia-Romagna, Sanchez Martin in Salamanca, Sauer in Mitteldeutschland).
- Jungverdorben als konkret belegter realer Familienname in frei zugaenglichen Referenzquellen.
- Macchina als belastbar belegter Familienname inkl. regionaler Verteilung.
- Oberst als belastbar belegter elsaessischer Familienname.
- Scuderi und Souto in ihrer konkret behaupteten Regionalitaet (teilweise nur nicht-kuratiert oder eingeschraenkt zugaenglich).

Technischer Hinweis zur Recherchegrenze:

- Mehrere sonst geeignete Namensverteilungsquellen waren automatisiert nicht abrufbar (z. B. HTTP 403), daher wurden unklare Punkte absichtlich nicht als gesicherte Tatsache formuliert.

## Verbindlichkeit

Diese Namens- und Begruendungsstruktur ist Teil der Alpha-0.15-Crewdefinition.

Aenderungen an Namen, Rufnamenlogik, Herkunft oder Bedeutungsrahmen duerfen nur ueber eine bewusste Aenderung dieses Dokuments erfolgen.
