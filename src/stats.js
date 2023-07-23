import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';

/** @param {import('./common').AnalyzedGuestEntry[]} entries */
export const getStatsForOneList = (entries) => {
  const entriesWithError = entries.filter(e => e.notInOther);
  const entriesWithLightError = entriesWithError.filter(e => e.isEmptyCaravan || e.sameNameButDifferentRoomNoFound || e.sameRoomNoAndFirstNameFound || e.similarFound);
  return {
    totalEntries: entries.length,
    entriesWithAnyError: entriesWithError.length,
    entriesWithHardError: entriesWithError.length - entriesWithLightError.length,
    entriesWithLightError: entriesWithLightError.length
  }
}

export const getStatsForAllLists = (data) => {
  const wolvoxStats = getStatsForOneList(data[KEY_CSV_WOLVOX]);
  const kimbilStats = getStatsForOneList(data[KEY_CSV_KIMBIL]);
  const hardErrorQuota = (wolvoxStats.entriesWithHardError + kimbilStats.entriesWithHardError) / (wolvoxStats.totalEntries + kimbilStats.totalEntries);
  return {
    wolvoxGuests: wolvoxStats.totalEntries,
    kimbilGuests: kimbilStats.totalEntries,
    differenceGuestAmount: Math.abs(wolvoxStats.totalEntries - kimbilStats.totalEntries),
    hardErrorQuota: Math.round(hardErrorQuota * 10000) / 100,
  };
};
