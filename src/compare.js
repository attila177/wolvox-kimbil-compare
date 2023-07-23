import { logger } from './common';
import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { fullEventMaker } from './reducers/reducer';

/** @typedef {import('./common').GuestEntry} GuestEntry */
/** @typedef {import('./common').AnalyzedGuestEntry} AnalyzedGuestEntry */

/**
 * Uses string.localeCompare() to compare the given strings
 * @param {string} a The first string of the comparison
 * @param {string} b The second string of the comparison
 * @returns {boolean} Whether string.localeCompare() returns true
 */
export const stringCompare = (a, b) => {
    return ('' + a).localeCompare(b + '');
};

/**
 * Uses a less strict algorithm to compare the given strings; if one string is contained in the other, true is returned
 * @param {string} a The first string of the comparison
 * @param {string} b The second string of the comparison
 * @returns {boolean} Whether === or contains(a,b) or contains(b,a) returns true
 */
const resemble = (s1, s2) => {
    return s1 === s2 || contains(s1, s2) || contains(s2, s1);
};

/**
 * Warning: Wolvox does not contain identity nos of non-turkish guests
 * @param {GuestEntry} baseEntry
 * @param {GuestEntry} guestEntry
 */
const identityMatch = (baseEntry, guestEntry) => {
    if (!baseEntry.isTurkishCitizen || !guestEntry.isTurkishCitizen) {
        return true;
    }
    return baseEntry.identityNo_simple === guestEntry.identityNo_simple;
};

/**
 * Strips leading zeros from given string
 * @param {string} s The string from which to strip leading zeros 
 * @returns {string} A string without leading zeros
 */
const stripLeadingZeros = (s) => {
    while (s.startsWith("0")) {
        s = s.substring(1);
    }
    return s;
};

/**
 * Uses a less strict algorithm to compare the given number strings by stripping leading zeros
 * @param {string} s1 The first number string of the comparison
 * @param {string} s2 The second number string of the comparison
 * @returns {boolean} Whether s1 === s2 after stripping leading zeros
 */
const numbersResemble = (s1, s2) => {
    s1 = stripLeadingZeros(s1);
    s2 = stripLeadingZeros(s2);
    return s1 === s2;
};

/**
 * Compares two entries.
 * @param {GuestEntry} baseEntry The first entry of the comparison 
 * @param {GuestEntry} otherEntry The second entry of the comparison
 * @returns {boolean} true iff numbersResemble(odaNo) && resemble(adi) && resemble(soyadi)
 */
export const compareEntries = (baseEntry, otherEntry) => {
    const odaMatch = numbersResemble(baseEntry.odaNo, otherEntry.odaNo);
    const adiMatch = resemble(baseEntry.adi_simple, otherEntry.adi_simple);
    const soyadiMatch = resemble(baseEntry.soyadi_simple, otherEntry.soyadi_simple);
    const identityNoMatch = identityMatch(baseEntry, otherEntry);
    if (odaMatch && adiMatch && soyadiMatch) {
        if (identityNoMatch) {
            logger.debug("Found match:", baseEntry, otherEntry);
        } else {
            logger.warn("Found match with different identityNos:", baseEntry, otherEntry);
        }
        return true;
    }
    /*
     * doesnt really make sense. it will find people with the same last name in the same room ie family members
     * anyway, the search _searchSimilarForOne_ works better than this.
    if ([adiMatch, soyadiMatch, identityNoMatch].filter(Boolean).length > 1) {
        logger.log("Partial match:", baseEntry, otherEntry);
    }
    */
    return false;
};

/**
 * Carries out comparison for all entries of the data of one realm.
 * @param {object} that Not needed
 * @param {object} fullData The container containing data of all realms
 * @param {import('./common').DataSourceTypeKey} key The key of the realm to compare all entries of
 * @param {import('./common').DataSourceTypeKey} otherKey The key of the other realm with which to compare
 * @returns The processed data for given realm
 */
const compareOne = (fullData, key, otherKey) => {
    /** @type {GuestEntry[]} */
    const baseData = fullData[key];
    /** @type {GuestEntry[]} */
    const otherData = fullData[otherKey];
    /** @type {AnalyzedGuestEntry[]} */
    let newData = [];

    if (baseData && otherData && baseData.length > 0 && otherData.length > 0) {
        for (let baseEntry of baseData) {
            let found = false;
            /** @type {AnalyzedGuestEntry} */
            let newEntry = { ...baseEntry };
            if (key === KEY_CSV_WOLVOX && !baseEntry.kimlikNo) {
                newEntry.wolvoxMissingTcNo = true;
            }
            for (let otherEntry of otherData) {
                if (compareEntries(baseEntry, otherEntry)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                newEntry.notInOther = true;
            } else {
                newEntry.notInOther = false;
            }
            newData.push(newEntry);
        }
    } else {
        newData = baseData;
    }
    return newData;
};

/**
 * Searches similar entries for all previously non-matched entries of the data of one realm.
 * @param {object} fullData The container containing data of all realms
 * @param {string} key The key of the realm to compare all entries of
 * @param {string} otherKey The key of the other realm with which to compare
 * @returns The processed data for given realm
 */
const searchSimilarForOne = (fullData, key, otherKey) => {
    /** @type {GuestEntry[]} */
    const baseData = fullData[key];
    /** @type {GuestEntry[]} */
    const otherData = fullData[otherKey];
    /** @type {AnalyzedGuestEntry[]} */
    let newData = [];

    if (baseData && otherData && baseData.length > 0 && otherData.length > 0) {

        const errorEntriesInOtherData = otherData.find(e => e.notInOther) ? otherData.filter(e => e.notInOther) : otherData;

        // check if there is entries with same name, same id, other room
        for (let baseEntry of baseData) {
            /** @type {AnalyzedGuestEntry} */
            let newEntry = baseEntry;
            if (baseEntry.notInOther) {
                const matchingFromOther = errorEntriesInOtherData.find(e =>
                    resemble(e.adi_simple, baseEntry.adi_simple) &&
                    resemble(e.soyadi_simple, baseEntry.soyadi_simple) &&
                    (e.isTurkishCitizen ? resemble(e.kimlikNo_simple, baseEntry.kimlikNo_simple) : true)
                )
                if (matchingFromOther) {
                    logger.log("Numbers do not match, but names are identical: mark as same name different room", newEntry, matchingFromOther);
                    newEntry.sameNameButDifferentRoomNoFound = true;
                }
            }
            newData.push(newEntry);
        }

        // check for similar entries using levenshtein
        for (let newEntry of newData) {
            if (newEntry.notInOther && !newEntry.sameNameButDifferentRoomNoFound) {
                let bestCandidate = null;
                let minDistance = Number.MAX_SAFE_INTEGER;
                for (let otherEntry of errorEntriesInOtherData) {
                    if (otherEntry.notInOther) {
                        // use levenshtein distance
                        const distance = levDist(newEntry, otherEntry, 1);
                        if (!bestCandidate || distance < minDistance) {
                            bestCandidate = otherEntry;
                            minDistance = distance;
                        }
                    }
                }
                if (bestCandidate && minDistance < 3) {
                    logger.log("Found a similar entry with levenshtein to", newEntry, minDistance, bestCandidate);
                    if (numbersResemble(newEntry.odaNo, bestCandidate.odaNo)) {
                        logger.log("Numbers resemble: mark as similar", newEntry, bestCandidate);
                        newEntry.similarFound = true;
                    }
                } else {
                    logger.debug("Could not find a similar entry with levenshtein!");
                    newEntry.similarFound = false;
                    for (let otherEntry of errorEntriesInOtherData) {
                        if (otherEntry.notInOther && numbersResemble(newEntry.odaNo, otherEntry.odaNo) && resemble(newEntry.adi_simple, otherEntry.adi_simple)) {
                            logger.log("Found a similar entry with roomNo & firstName to", newEntry, otherEntry);
                            newEntry.sameRoomNoAndFirstNameFound = true;
                            break;
                        }
                    }
                }
            }
        }
    } else {
        newData = baseData;
    }
    return newData;
};

/**
 * Carries out all necessary comparison operations, then triggers an event with the updated data.
 * @param {object} that Needed for the dispatch function
 * @param {object} fullData The unprocessed data
 */
export const compareAllCsvData = (that) => {
    const fullData = {
        [KEY_CSV_KIMBIL]: that.converters[KEY_CSV_KIMBIL]?.convertOneCsvData(that),
        [KEY_CSV_WOLVOX]: that.converters[KEY_CSV_WOLVOX]?.convertOneCsvData(that)
    }
    let dataCopy = { ...fullData };
    dataCopy[KEY_CSV_KIMBIL] = compareOne(dataCopy, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX);
    dataCopy[KEY_CSV_WOLVOX] = compareOne(dataCopy, KEY_CSV_WOLVOX, KEY_CSV_KIMBIL);
    dataCopy[KEY_CSV_KIMBIL] = searchSimilarForOne(dataCopy, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX);
    dataCopy[KEY_CSV_WOLVOX] = searchSimilarForOne(dataCopy, KEY_CSV_WOLVOX, KEY_CSV_KIMBIL);
    that.props.dispatch(fullEventMaker(dataCopy));
};

/**
 * Whether given string is contained in other given string.
 * @param {string} container The string within which to search
 * @param {string} contained The string for which to search
 * @returns {boolean} true iff contained is contained in container
 */
const contains = (container, contained) => {
    return container.indexOf(contained) >= 0;
};

/**
 * Computes the levenshtein distance for two given entries' name fields, if the length difference
 * of the extracted strings is below given threshold. If not, the length of the longer string
 * is returned as the distance.
 * @param {GuestEntry} sFull The first entry
 * @param {GuestEntry} tFull The second entry
 * @param {number} maxLengthDifference The threshold for the computation of the distance
 */
export const levDist = (sFull, tFull, maxLengthDifference) => {
    /** @param {GuestEntry} e */
    const reduce = (e) => {
        const id = e.isTurkishCitizen ? e.kimlikNo_simple : '';
        return (e.adi_simple + e.soyadi_simple + id).replace(/[*]+/, '');
    }
    let s = reduce(sFull);
    let t = reduce(tFull);
    let d = []; //2d matrix

    // Step 1
    let n = s.length;
    let m = t.length;

    if (n === 0) return m;
    if (m === 0) return n;

    if (Math.abs(n - m) > maxLengthDifference) {
        return Math.max(n, m);
    }

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (let i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (let i = n; i >= 0; i--) d[i][0] = i;
    for (let j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (let i = 1; i <= n; i++) {
        let s_i = s.charAt(i - 1);

        // Step 4
        for (let j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i === j && d[i][j] > 4) return n;

            let t_j = t.charAt(j - 1);
            let cost = (s_i === t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            let mi = d[i - 1][j] + 1;
            let b = d[i][j - 1] + 1;
            let c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }
    // Step 7
    const result = d[n][m];
    logger.debug(`Levdist between _${s}_ and _${t}_ is ${result}.`);
    return result;
};