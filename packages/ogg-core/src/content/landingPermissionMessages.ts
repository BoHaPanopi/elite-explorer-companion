import type { Language } from "../types/language.ts";

export const LANDING_PERMISSION_FALLBACK_STATION = "die Station";

export const LANDING_PERMISSION_REMINDER_VARIANTS: Record<Language, string[]> = {
  de: [
    "Fuer {station} hamma no koa Landeerlaubnis.",
    "{station} laesst uns grad no ned ran.",
    "No koa Freigabe fuer {station}.",
  ],
  en: [
    "We still do not have landing permission for {station}.",
    "{station} has not cleared us for docking yet.",
    "No landing permission for {station} yet.",
  ],
  fr: [
    "Nous n’avons pas encore l’autorisation d’amarrage pour {station}.",
    "{station} ne nous a pas encore autorises a nous amarrer.",
    "Pas encore d’autorisation d’amarrage pour {station}.",
  ],
  it: [
    "Non abbiamo ancora il permesso di attracco per {station}.",
    "{station} non ci ha ancora autorizzati all’attracco.",
    "Nessun permesso di attracco per {station} per ora.",
  ],
  es: [
    "Aun no tenemos permiso de atraque para {station}.",
    "{station} todavia no nos ha autorizado a atracar.",
    "Todavia no hay permiso de atraque para {station}.",
  ],
};
