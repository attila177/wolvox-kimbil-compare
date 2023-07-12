import { logger } from './common';
import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { fullEventMaker } from './reducers/reducer';

/** @typedef {import('./guest-data').GuestEntry} GuestEntry */
/** @typedef {import('./guest-data').AnalyzedGuestEntry} AnalyzedGuestEntry */

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

/** @param {string} input */
const reduceStars = (input) => {
    if (!input) {
        return input;
    }
    return input.replace(/[*]+/g, '+')
}


/** @param {string} input */
const mimicNameAnonymization = (input) => {
    return input.split(' ').map(substr => substr.substring(0, 2)).join('***** ') + '*****';
};

/**
 * @param {string} input1 The first string of the comparison (will be called once for each of kimbil and wolvox)
 * @param {string} input2 The second string of the comparison (will be called once for each of kimbil and wolvox)
 */
const resembleDespiteNameAnonymization = (input1, input2) => {
    let s1;
    let s2;
    if (input1.includes('*') && !input2.includes('*')) {
        s1 = reduceStars(input1);
        s2 = reduceStars(mimicNameAnonymization(input2));
    } else if (!input1.includes('*') && input2.includes('*')) {
        s1 = reduceStars(mimicNameAnonymization(input1));
        s2 = reduceStars(input2);
    }
    
    return s1 === s2 || contains(s1, s2) || contains(s2, s1);
};


/** @param {string} input */
const mimicIdentityNoAnonymization = (input) => {
    if (input && input.length > 5) {
        const anonStars = new Array(input.length - 4).join('*');
        return `${input.substring(0,2)}${anonStars}${input.substring(input.length - 3)}`;
    } else {
        return input;
    }
};

/**
 * @param {string} input1 The first string of the comparison (will be called once for each of kimbil and wolvox)
 * @param {string} input2 The second string of the comparison (will be called once for each of kimbil and wolvox)
 */
const resembleDespiteIdentityNoAnonymization = (input1, input2) => {
    let s1;
    let s2;
    if (input1.includes('*') && !input2.includes('*')) {
        s1 = reduceStars(input1);
        s2 = reduceStars(mimicIdentityNoAnonymization(input2));
    } else if (!input1.includes('*') && input2.includes('*')) {
        s1 = reduceStars(mimicIdentityNoAnonymization(input1));
        s2 = reduceStars(input2);
    }
    
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
 * @param {GuestEntry} baseEntry The first entry of the comparison 
 * @param {GuestEntry} otherEntry The second entry of the comparison
 * @returns {boolean} true iff numbersResemble(odaNo) && resemble(adi) && resemble(soyadi)
 */
export const compareEntries = (baseEntry, otherEntry) => {
    const odaMatch = numbersResemble(baseEntry.odaNo, otherEntry.odaNo);
    const adiMatch = resembleDespiteNameAnonymization(baseEntry.adi_simple, otherEntry.adi_simple);
    const soyadiMatch = resembleDespiteNameAnonymization(baseEntry.soyadi_simple, otherEntry.soyadi_simple);
    const identityNoMatch = resembleDespiteIdentityNoAnonymization(baseEntry.identityNo, otherEntry.identityNo);
    if (odaMatch && adiMatch && soyadiMatch) {
        logger.log("Found match:", baseEntry, otherEntry);
        if (!identityNoMatch) {
            logger.warn('Match with different identityNo!', baseEntry, otherEntry);
        }
        return true;
    }
    if ([odaMatch, adiMatch, soyadiMatch, identityNoMatch].filter(Boolean).length > 1) {
        logger.log("Partial match:", baseEntry, otherEntry);
    }
    return false;
};

/**
 * Carries out comparison for all entries of the data of one realm.
 * @param {object} that Not needed
 * @param {object} fullData The container containing data of all realms
 * @param {string} key The key of the realm to compare all entries of
 * @param {string} otherKey The key of the other realm with which to compare
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
        for (let baseEntry of baseData) {
            /** @type {AnalyzedGuestEntry} */
            let newEntry = baseEntry;
            if (baseEntry.notInOther) {
                newEntry = { ...baseEntry };
                let bestCandidate = null;
                let minDistance = 0;
                for (let otherEntry of otherData) {
                    if (otherEntry.notInOther) {
                        // use levenshtein distance
                        const distance = levDist(newEntry, otherEntry, 2);
                        if (!bestCandidate || distance < minDistance) {
                            bestCandidate = otherEntry;
                            minDistance = distance;
                        }
                    }
                }
                if (bestCandidate && minDistance < 3) {
                    logger.log("Found a similar entry with levenshtein to", newEntry, minDistance, bestCandidate);
                    if (numbersResemble(baseEntry.odaNo, bestCandidate.odaNo)) {
                        logger.log("Numbers resemble: mark as similar", newEntry, bestCandidate);
                        newEntry.similarFound = true;
                    } else {
                        if (minDistance === 0) {
                            logger.log("Numbers do not resemble, but names are identical: mark as same name different room", newEntry, bestCandidate);
                            newEntry.sameNameButDifferentRoomNoFound = true;
                        }
                    }
                } else {
                    logger.log("Could not find a similar entry with levenshtein!");
                    newEntry.similarFound = false;
                    for (let otherEntry of otherData) {
                        if (otherEntry.notInOther && numbersResemble(baseEntry.odaNo, otherEntry.odaNo) && resemble(baseEntry.adi_simple, otherEntry.adi_simple)) {
                            logger.log("Found a similar entry with roomNo & firstName to", newEntry, otherEntry);
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