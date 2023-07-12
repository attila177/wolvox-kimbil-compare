/**
 * @typedef {Object} GuestEntryInput
 * @property {string} odaNo The room number
 * @property {string} adi The first name (with special characters)
 * @property {string} adi_simple The first name (without special characters)
 * @property {string} soyadi The last name (with special characters)
 * @property {string} soyadi_simple The last name (without special characters)
 * @property {string} giris A string representation of the date of arrival
 * @property {string} cikis A string representation of the date of departure
 * @property {string} gecerliBelge Passport No of non-turkish citizens
 * @property {string} kimlikNo TC No of turkish citizens
 * @property {string} uyruk Nationality
 */

/**
 * @typedef {Object} GuestEntryExtraData
 * @property {boolean} isValid
 * @property {string} identityNo Abstract unique ID derived either from _gecerliBelge_ or _kimlikNo_
 */

/**
 * @typedef {GuestEntryInput & GuestEntryExtraData} GuestEntry
 */

/**
 * @typedef {Object} GuestEntryAnalysisExtraData
 * @property {boolean} notInOther true if the entry is not present in the other guest list. written in _compareOne_ function
 * @property {boolean} similarFound true if a similar entry is present in the other guest list. written in _searchSimilarForOne_ function
 * @property {boolean} sameNameButDifferentRoomNoFound written in _searchSimilarForOne_ function
 * @property {boolean} sameRoomNoAndFirstNameFound written in _searchSimilarForOne_ function
 */

/**
 * @typedef {GuestEntry & GuestEntryAnalysisExtraData} AnalyzedGuestEntry
 */

/**
 * @type {{[name: string]: {required: boolean}}}
 */
const FIELDS = {
  'odaNo': {required: true},
  'adi': {required: true},
  'soyadi': {required: true},
  'giris': {required: true},
  'cikis': {required: false},
  'gecerliBelge': {required: true},
  'kimlikNo': {required: true},
  'uyruk': {required: true}
}

export default FIELDS;
