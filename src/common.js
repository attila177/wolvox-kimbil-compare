/**
 * @typedef {Object} GuestEntryInput
 * @property {string} odaNo The room number
 * @property {string} adi The first name (with special characters)
 * @property {string} adi_simple The first name (without special characters) (anonymized and with reduced number of stars)
 * @property {string} soyadi The last name (with special characters)
 * @property {string} soyadi_simple The last name (without special characters) (anonymized and with reduced number of stars)
 * @property {string} giris A string representation of the date of arrival
 * @property {string} cikis A string representation of the date of departure
 * @property {string} gecerliBelge Warning! Will not be filled out in almost all Wolvox cases! Passport No of non-turkish citizens
 * @property {string} gecerliBelge_simple Warning! Will not be filled out in almost all Wolvox cases! Passport No of non-turkish citizens
 * @property {string} kimlikNo TC No of turkish citizens
 * @property {string} kimlikNo_simple TC No of turkish citizens (anonymized and with reduced number of stars)
 * @property {string} uyruk Nationality
 * @property {string} [not] Notes about the entry
 */

/**
 * @typedef {Object} GuestEntryExtraData
 * @property {boolean} isValid
 * @property {boolean} isTurkishCitizen
 * @property {boolean} isEmptyCaravan only true if wolvox entry && entry.not contains the words "bo" and "karavan"
 * @property {string} paddedOdaNo The room number, but with 0 added to the start
 * @property {string} identityNo Abstract unique ID derived either from _gecerliBelge_ or _kimlikNo_
 * @property {string} identityNo_simple Abstract unique ID derived either from _gecerliBelge_simple_ or _kimlikNo_simple_
 */

/**
 * @typedef {GuestEntryInput & GuestEntryExtraData} GuestEntry
 */

/**
 * @typedef {Object} GuestEntryAnalysisExtraData
 * @property {boolean} notInOther true if the entry is not present in the other guest list. written in _compareOne_ function
 * @property {boolean} wolvoxMissingTcNo 
 * @property {boolean} similarFound true if a similar entry is present in the other guest list. written in _searchSimilarForOne_ function
 * @property {boolean} sameNameButDifferentRoomNoFound written in _searchSimilarForOne_ function
 * @property {boolean} sameRoomNoAndFirstNameFound written in _searchSimilarForOne_ function
 */

/**
 * @typedef {GuestEntry & GuestEntryAnalysisExtraData} AnalyzedGuestEntry
 */


export const KEY_CSV_WOLVOX = "csv-wolvox";
export const KEY_CSV_KIMBIL = "csv-kimbil";

/**
 * @typedef {'csv-wolvox' | 'csv-kimbil'} DataSourceTypeKey
 */

export const DATA_SOURCE_TYPE_LABEL = {
    [KEY_CSV_WOLVOX]: 'Akınsoft Wolvox CSV',
    [KEY_CSV_KIMBIL]: 'Emniyet Kimbil CSV',
}

const output_log = true;
const output_debug_log = false;

/**
 * Outputs all given arguments into console.log, if output_debug is true.
 */
export const logger = output_log ? {
    ...console,
    debug: output_debug_log ? console.log : () => {}
} : {
    debug: () => {},
    log: () => {},
    warn: () => {},
    error: () => {},
  };

export const isNumberlike = (input) => {
    try {
        return Number.isInteger(Number.parseInt(input));
    } catch (err) {
        return false;
    }
};

/** @param {GuestEntry} entry */
export const isTurkishCitizen = (entry) => {
    return entry.uyruk === 'TÜRKİYE' || entry.uyruk === 'TC';
}

/** @param {GuestEntry} entry */
export const isEmptyCaravan = (entry) => {
    return entry.not && entry.not.toLowerCase().includes('bo') && entry.not.toLowerCase().includes('karavan');
}