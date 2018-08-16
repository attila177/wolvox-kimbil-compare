import { debug, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { fullEventMaker } from './reducers/reducer';

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
 * @param {object} baseEntry The first entry of the comparison 
 * @param {object} otherEntry The second entry of the comparison
 * @returns {boolean} true iff numbersResemble(odaNo) && resemble(adi) && resemble(soyadi)
 */
const compareEntries = (baseEntry, otherEntry) => {
    const oda = numbersResemble(baseEntry.odaNo, otherEntry.odaNo);
    const adi = resemble(baseEntry.adi_simple, otherEntry.adi_simple);
    const soyadi = resemble(baseEntry.soyadi_simple, otherEntry.soyadi_simple);
    if (oda && adi && soyadi) {
        debug("Found match:", baseEntry, otherEntry);
        return true;
    }
    if (oda || adi || soyadi) {
        // console.log("Partial match:", baseEntry, otherEntry, oda, adi, soyadi);
    }
    return false;
};

/**
 * Carries out comparison for all entries of the data of one realm.
 * @param {object} that Not needed
 * @param {object} fullData The container containing data of all realms
 * @param {string} key The key of the realm to compare all entries of
 * @param {string} otherKey The key of the other realm with which to compare
 * @returns {array} The processed data for given realm
 */
const compareOne = (that, fullData, key, otherKey) => {
    const baseData = fullData[key];
    const otherData = fullData[otherKey];
    let newData = [];

    if (baseData && otherData && baseData.length > 0 && otherData.length > 0) {
        for (let baseEntry of baseData) {
            let found = false;
            let newEntry = { ...baseEntry };
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
 * @param {object} that Not needed
 * @param {object} fullData The container containing data of all realms
 * @param {string} key The key of the realm to compare all entries of
 * @param {string} otherKey The key of the other realm with which to compare
 * @returns {array} The processed data for given realm
 */
const searchSimilarForOne = (that, fullData, key, otherKey) => {
    const baseData = fullData[key];
    const otherData = fullData[otherKey];
    let newData = [];

    if (baseData && otherData && baseData.length > 0 && otherData.length > 0) {
        for (let baseEntry of baseData) {
            let newEntry = baseEntry;
            if (baseEntry.notInOther) {
                newEntry = { ...baseEntry };
                let bestCandidate = null;
                let minDistance = 0;
                for (let otherEntry of otherData) {
                    if (otherEntry.notInOther && numbersResemble(baseEntry.odaNo, otherEntry.odaNo)) {
                        // use levenshtein distance
                        const distance = levDist(newEntry, otherEntry, 2);
                        if (!bestCandidate || distance < minDistance) {
                            bestCandidate = otherEntry;
                            minDistance = distance;
                        }
                    }
                }
                if (bestCandidate && minDistance < 3) {
                    debug("Found a similar entry with levenshtein to", newEntry, minDistance, bestCandidate);
                    newEntry.similarFound = true;
                } else {
                    debug("Could not find a similar entry with levenshtein!");
                    newEntry.similarFound = false;
                    for (let otherEntry of otherData) {
                        if (otherEntry.notInOther && numbersResemble(baseEntry.odaNo, otherEntry.odaNo) && resemble(baseEntry.adi_simple, otherEntry.adi_simple)) {
                            debug("Found a similar entry with roomNo & firstName to", newEntry, otherEntry);
                            newEntry.sameRoomNoAndFirstNameFound = true;
                            break;
                        }
                    }
                }
            }
            newData.push(newEntry);
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
export const compareAllCsvData = (that, fullData) => {
    let dataCopy = { ...fullData };
    dataCopy[KEY_CSV_KIMBIL] = compareOne(that, dataCopy, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX);
    dataCopy[KEY_CSV_WOLVOX] = compareOne(that, dataCopy, KEY_CSV_WOLVOX, KEY_CSV_KIMBIL);
    dataCopy[KEY_CSV_KIMBIL] = searchSimilarForOne(that, dataCopy, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX);
    dataCopy[KEY_CSV_WOLVOX] = searchSimilarForOne(that, dataCopy, KEY_CSV_WOLVOX, KEY_CSV_KIMBIL);
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
 * @param {object} sFull The first string
 * @param {object} tFull The second string
 * @param {number} maxLengthDifference The threshold for the computationo of the distance
 */
export const levDist = (sFull, tFull, maxLengthDifference) => {
    let s = sFull.adi_simple + sFull.soyadi_simple;
    let t = tFull.adi_simple + tFull.soyadi_simple;
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
    return d[n][m];
};