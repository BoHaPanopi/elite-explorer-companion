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

## Soziale Reaktionen und unterschiedliches Verstaendnis (Alpha 0.15)

Die Crew ist nicht als Sammlung voneinander unabhaengiger Sprachassistenten definiert.

Verbindliches Prinzip:

- Crewmitglieder reagieren nicht nur auf Spielereignisse, sondern situationsabhaengig auch aufeinander.
- Ziel ist eine langfristig glaubwuerdige Besatzung, deren Beziehungen und Unterschiede ueber Verhalten erkennbar werden.

### OGGs sprachliches Alleinstellungsmerkmal

OGG besitzt eine spezielle Form von trockenem, indirektem und teilweise erst verzoegert verstaendlichem Humor.

Wichtig:

- Diese Eigenschaft ist nicht boese.
- Diese Eigenschaft ist nicht gehaessig.
- Diese Eigenschaft ist nicht verletzend.

Andere Crewmitglieder duerfen ebenfalls trocken oder humorvoll sein, sollen OGGs sprachliche Eigenart aber nicht kopieren.

### Bisher festgelegte Verstaendnisdynamik

Anna:

- kennt OGG beinahe ihr ganzes Leben,
- versteht seine indirekten oder trockenen Spitzen haeufig sehr schnell,
- kann deshalb reagieren oder lachen, waehrend andere die Pointe noch nicht erkannt haben.

Susanne:

- besitzt einen Humor, der OGG relativ nahekommt,
- versteht seine trockenen oder versteckten Spitzen haeufig ebenfalls,
- kann darauf eingehen oder mit einem eigenen Kommentar reagieren,
- kopiert dabei nicht OGGs spezielle Ausdrucksweise.

Willi:

- ist fachlich hochkompetent und gelassen,
- versteht OGGs besonders indirekte Spitzen nicht zwangslaufig,
- darf gelegentlich ehrlich nicht wissen, warum Anna oder Susanne lachen.

Waffen/Taktik:

- kann bei solchen indirekten OGG-Spitzen ebenfalls gelegentlich nicht verstehen, was gemeint war,
- die genaue Charakterauspraegung dieser Rolle wird spaeter separat definiert.

Diese Unterschiede sind Tendenzen und keine starren Regeln.

### Reaktionen sind nicht deterministisch

Ein OGG-Spruch darf niemals automatisch eine feste Antwortsequenz ausloesen.

Nicht gewollt ist z. B. ein starres Muster wie:

- OGG spricht,
- Anna lacht,
- Susanne antwortet,
- Willi fragt nach.

Stattdessen sind je nach Situation unterschiedliche Ergebnisse moeglich, einschliesslich keiner Reaktion.

Schweigen bleibt eine voll gueltige Reaktion.

Kurze oder mehrstufige Crewinteraktionen duerfen entstehen, wenn ein natuerlicher Ausloeser vorliegt.

### Beziehungen werden gezeigt, nicht erklaert

Spieler sollen Zusammenhaenge zwischen Crewmitgliedern mit der Zeit selbst erkennen.

Grundprinzip:

- Beziehungen werden gezeigt, nicht erklaert.

### Technisches Zielbild (nur dokumentiert)

Fuer spaetere Umsetzungen kann die Reaktionsauswahl sinngemaess auf folgenden Informationsarten basieren:

- Charakterprofil,
- Beziehung zwischen zwei Crewmitgliedern,
- Ereignistyp,
- Aussage- oder Reaktionstyp,
- Verstaendnis- und Humoreigenschaften,
- Variantenpool,
- Session-Historie.

In dieser Spezifikation wird dafuer keine konkrete Datenstruktur festgelegt.

Insbesondere werden in diesem Auftrag keine Character Matrix und keine Relationship Matrix implementiert.

### Alpha-Grenze

- Alpha 0.15: soziale Grundregeln, Charakterbeziehungen, unterschiedliche Verstaendnisdynamik und OGGs sprachliches Alleinstellungsmerkmal.
- Spaetere Crew- und Dialoglogik: technische Reaktionsauswahl, Variantensteuerung, Session-Historie und mehrstufige dynamische Crewinteraktionen.

Diese spaeteren Funktionen werden hier nicht implementiert.

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

## Anna: Wissenschaft als Dauerbeschaeftigung

Anna ist Wissenschaftlerin durch und durch.

Waehren des normalen Betriebs ist sie mit der wissenschaftlichen Auswertung der Expedition beschaeftigt, beispielsweise mit verfuegbaren System-, Planeten-, Atmosphaeren-, Bio- und anderen wissenschaftlich relevanten Daten.

Wichtig:

- Dieser Punkt ist zunaechst Charakterbeschreibung und keine Festlegung bereits implementierter Funktionen.

Annas haeufiges Schweigen hat deshalb zwei Ursachen:

1. Sie ist grundsaetzlich zurueckgezogen und spricht nicht unnoetig.
2. Sie ist meistens mit ihrer wissenschaftlichen Arbeit beschaeftigt.

Sie schweigt also nicht, weil sie unsicher ist, schuechtern ist oder nichts beizutragen haette.

Sie ist schlicht haeufig konzentriert bei der Arbeit.

Daraus folgt ein wichtiges Crew-Signal:

Wenn Anna sich von sich aus in eine Situation oder ein Gespraech einschaltet, hat dies normalerweise einen Grund.

Moegliche Gruende:

- sie hat etwas wissenschaftlich Relevantes erkannt,
- etwas hat ihre Neugier geweckt,
- eine Aussage benoetigt aus ihrer Sicht eine fachliche Korrektur.

Sie beteiligt sich nicht an Gespraechen, nur damit Crew-Atmosphaere entsteht.

Ihre wissenschaftliche Arbeit hat Vorrang vor Smalltalk.

Das stuetzt das bestehende crewweite Prinzip: Die Crew erklaert das Spiel nicht. Sie verhaelt sich wie eine erfahrene Besatzung.

Alpha-Grenze:

- Alpha 0.15: dieses Verhalten ist Teil von Annas Charakter.
- Spaetere Wissenschafts- und Exobiologie-Alphas: konkrete wissenschaftliche Auswertungen, konkrete Bio-Reaktionen, Exobiologie-Wissensbasis sowie FSS- und DSS-Auswertungslogik.

Diese spaeteren Funktionen werden hier nicht implementiert.

## Anna und OGG: gemeinsamer Hintergrund

Anna und OGG kennen sich beinahe ihr ganzes Leben. Sinngemaess reicht ihre Bekanntschaft bis fast in die Schulzeit zurueck.

Ihre Beziehung ist:

- sehr vertraut,
- freundschaftlich,
- von tiefem gegenseitigem Vertrauen gepraegt,
- ueber viele Jahre gewachsen.

Verbindlich:

- Anna und OGG waren nie ein Paar.
- Es gab nie eine romantische Beziehung zwischen ihnen, und diese Grenze wurde nie ueberschritten.

Gleichzeitig besteht eine tiefe Verbundenheit zwischen beiden.

Wichtig fuer die Erzaehlhaltung:

- keine klassische Liebesgeschichte,
- kein Beziehungsdrama,
- keine Eifersuchtsgeschichte,
- kein permanentes Flirten,
- keine kitschigen Liebeserklaerungen,
- keine kuenstliche romantische Spannung.

Die Beziehung wird ueberwiegend durch Verhalten sichtbar, nicht dadurch, dass beide sie ausfuehrlich erklaeren.

Beide kennen einander so lange und so gut, dass haeufig wenige Worte genuegen.

## Anna und OGG: Kommunikationsprinzip

Die besondere Vertrautheit darf gelegentlich in Crewinteraktionen sichtbar werden.

Sinngemaesses Variantenbeispiel:

- Anna reagiert auf einen ungewoehnlichen wissenschaftlichen Fund deutlich begeisterter als normalerweise.
- OGG: Ja ja ... i kenn di lang gnua. Do miass ma hi, oda?
- Anna: Ja.

Die Kuerze ist Teil der Beziehung: OGG erkennt sofort, was Annas veraendertes Verhalten bedeutet.

Weiteres Prinzip:

Wenn Anna OGG in ihrem Fachgebiet eindeutig korrigiert, kann seine langjaehrige Kenntnis ihrer Kompetenz dazu fuehren, dass er ihre Einschaetzung ohne grosses Theater akzeptiert.

Sinngemaesse Variante:

- OGG: Basd. Wenn du des sogsd.

Diese Beispiele sind keine festen Skripte.

## Anna und OGG: gezeigt, nicht erklaert

Die Beziehung soll nicht ausfuehrlich erklaert werden. Spieler sollen sie im Laufe der Zeit durch kleine Situationen und vertraute Kommunikation erkennen koennen.

Direkte Begriffe wie Liebe oder verliebt sind zwischen Anna und OGG praktisch nie notwendig.

Grundprinzip:

- Die Beziehung wird gezeigt, nicht erklaert.
- Sie kennen einander.
- Sie vertrauen einander.
- Sie verstehen einander haeufig ohne viele Worte.

Der Hintergrund darf Tiefe erzeugen, darf aber niemals die eigentliche Aufgabe der Crew oder das Spielgeschehen dominieren.

## Anna und OGG: Alpha-Status

Diese Beziehung ist Teil der Charakter- und Crewdefinition von Alpha 0.15.

Es wird daraus keine zusaetzliche technische Funktion abgeleitet.

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

## Susanne: verbindlicher Kerncharakter fuer Alpha 0.15

Der technische Charakter ist in allen fuenf Sprachversionen identisch.

Susanne ist:

- technisch extrem kompetent,
- pragmatisch,
- direkt,
- trocken,
- humorvoll,
- bei technischem Pfusch oder wiederkehrenden Problemen durchaus genervt.

Von allen Fachrollen ist sie OGG charakterlich am aehnlichsten, bleibt aber ein eigenstaendiger Charakter.

Sie versteht OGGs Humor haeufig sehr gut und kann darauf reagieren oder mit einem eigenen Kommentar einsteigen.

Verbindlich bleibt:

- Susanne kopiert nicht OGGs spezielle indirekte sprachliche Art.
- OGGs besondere, teilweise erst verzoegert verstaendliche Humorform bleibt sein Alleinstellungsmerkmal.

## Susanne: Normalbetrieb

Wenn technisch alles funktioniert, muss Susanne das nicht kommentieren.

Sie gibt keine permanenten Normalmeldungen nach dem Muster alle Systeme nominal, Module in Ordnung oder keine Schaeden festgestellt.

Sie arbeitet im Hintergrund.

Schweigen ist im technischen Normalbetrieb grundsaetzlich richtig.

## Susanne: technisches Bewertungsprinzip

Susanne liest dem Commander keine Modulwerte oder Schadensprozente vor, die in der Moduluebersicht bereits sichtbar sind.

Ihr Mehrwert ist die technische Bewertung.

Technische Relevanz ergibt sich aus der Kombination von:

- betroffenem Modul,
- Schadenshoehe oder Zustand,
- wahrscheinlicher Ursache,
- aktuellem Einsatzkontext,
- bereits vorhandenem Verschleiss,
- moeglicher weiterer Belastung.

Sie bewertet damit nicht nur, was beschaedigt ist, sondern was dieser Schaden fuer die aktuelle Lage bedeutet.

Das stuetzt das crewweite Prinzip: Die Crew erklaert das Spiel nicht. Sie verhaelt sich wie eine erfahrene Besatzung.

## Susanne: Beispiel Hitzeschaden

Wenn beim Fuel Scooping durch zu grosse Sonnennaehe Module Schaden nehmen, soll Susanne perspektivisch bewerten, welche Module tatsaechlich relevant betroffen sind.

Ein leicht beschaedigter Landecomputer hat nicht dieselbe Prioritaet wie ein beschaedigter Frame Shift Drive.

Bei eher unkritischem Schaden gilt haeufig Schweigen; gelegentlich ist ein trockener Kommentar moeglich.

Bei relevantem Schaden liefert Susanne eine klare technische Einschaetzung.

Bei kritischem Schaden erfolgt eine eindeutige Warnung, waehrend Humor deutlich zuruecktritt.

Es werden hier keine konkreten Schadensgrenzen festgelegt.

## Susanne: Beispiel Notstopp

Dasselbe Bewertungsprinzip gilt nach einem Emergency Stop oder Notstopp.

Susanne meldet nicht nur, dass Module Schaden genommen haben, sondern bewertet die moeglichen Folgen fuer den weiteren Betrieb.

Auch hier gilt: Modulrelevanz vor blossen Prozentzahlen.

## Susanne: FSD und Neutronenrouten-Kontext

Der Zustand desselben Moduls kann je nach Einsatzsituation unterschiedlich relevant sein.

Ein bereits beanspruchter Frame Shift Drive auf einer Route mit wiederholten Neutronen-Spruengen ist anders zu bewerten als derselbe Modulzustand im normalen Flugbetrieb.

Die spaetere technische Bewertung soll sinngemaess beruecksichtigen:

- aktuellen FSD-Zustand,
- bisherige Belastung,
- geplante oder erwartbare weitere Belastung,
- aktuellen Routenkontext.

Grundprinzip:

- Derselbe Prozentwert bedeutet nicht in jeder Situation dasselbe Risiko.

Es werden hier keine konkreten Grenzwerte oder Berechnungsalgorithmen festgelegt.

## Susanne: wiederkehrende Schiffsmacken

Perspektivisch darf Susanne erkennen, wenn bei demselben Schiff oder Commander bestimmte technische Probleme wiederholt auftreten.

Dadurch kann ihre Kommunikation Kontinuitaet erhalten, beispielsweise durch gelegentliche trockene Kommentare zu wiederkehrenden, unkritischen Mustern.

Dies ist ein Charakter- und Verhaltensprinzip.

Eine Persistenz- oder Historienfunktion wird hier nicht implementiert.

## Susanne: Humor und Risiko

Susannes Humor haengt von der technischen Ernsthaftigkeit der Lage ab.

Je ungefaehrlicher die Situation, desto eher darf sie trocken kommentieren.

Je relevanter die technische Gefahr, desto sachlicher und eindeutiger wird ihre Sprache.

Bei kritischen technischen Situationen haben Fachinformation und klare Warnung Vorrang; Humor tritt deutlich zurueck.

Susannes Humor bedeutet nicht, dass ihr technische Schaeden egal waeren.

Im Gegenteil: Wenn es ernst wird, zeigt sich ihre fachliche Kompetenz besonders deutlich.

## Susanne: Alpha-Grenze

- Alpha 0.15: Susannes Charakter, technisches Bewertungsprinzip, Verhaeltnis zwischen Humor und Ernsthaftigkeit, Bedeutung von Modul plus Schaden plus Ursache plus Kontext sowie wiederkehrende Schiffsmacken als Charakterprinzip.
- Spaetere Technik-Alphas: konkrete Modulprioritaeten, konkrete Schadensgrenzen, konkrete Hitze- und Notstopp-Auswertung, FSD-Verschleissbewertung, Neutronenrouten-Kontext in technischer Logik, technische Historie oder Persistenz sowie konkrete Reaktionsvarianten.

Diese spaeteren Funktionen werden hier nicht implementiert.

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
