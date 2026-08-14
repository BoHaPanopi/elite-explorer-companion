import type { CrewLocale, CrewRole } from "../features/crewProfiles.ts";

export const CREW_VOICE_PREVIEW_TEXTS: Record<CrewRole, Record<CrewLocale, string>> = {
  navigation: {
    de: "Kurs steht. Nächstes System ist ausgewählt.",
    uk: "Course is set. The next system is selected.",
    fr: "Cap défini. Le prochain système est sélectionné.",
    it: "Rotta impostata. Il prossimo sistema è selezionato.",
    es: "Rumbo fijado. El próximo sistema está seleccionado.",
  },
  science: {
    de: "Die Daten sind interessant. Das sollten wir uns genauer ansehen.",
    uk: "The data is interesting. We should take a closer look.",
    fr: "Les données sont intéressantes. Nous devrions les examiner de plus près.",
    it: "I dati sono interessanti. Dovremmo esaminarli più attentamente.",
    es: "Los datos son interesantes. Deberíamos examinarlos más detenidamente.",
  },
  engineeringSystems: {
    de: "Alle Systeme arbeiten innerhalb der normalen Parameter.",
    uk: "All systems are operating within normal parameters.",
    fr: "Tous les systèmes fonctionnent selon les paramètres normaux.",
    it: "Tutti i sistemi funzionano entro i parametri normali.",
    es: "Todos los sistemas funcionan dentro de los parámetros normales.",
  },
  weaponsTactics: {
    de: "Taktische Systeme sind bereit.",
    uk: "Tactical systems are ready.",
    fr: "Les systèmes tactiques sont prêts.",
    it: "I sistemi tattici sono pronti.",
    es: "Los sistemas tácticos están listos.",
  },
};

export const ANNA_TO_OGG_REFERENCE_SENTENCE_DE =
  "Ach OGG … du hast dich wirklich kein bisschen verändert.";
