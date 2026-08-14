export const ALPHA_TESTING_NOTICE_VERSION = "0.14.16";

// version-scoped key so future alphas show their own notice
const storageKey = `ogg.alphaTesterNotice.${ALPHA_TESTING_NOTICE_VERSION}`;

export function alphaTestingNoticeAlreadySeen(): boolean {
  return localStorage.getItem(storageKey) === "read";
}

export function markAlphaTestingNoticeSeen(): void {
  localStorage.setItem(storageKey, "read");
}
