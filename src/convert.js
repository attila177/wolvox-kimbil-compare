import { debug, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { stringCompare } from './compare';
import { eventMaker } from './reducers/reducer';

let WOLVOX_ODA_NO_INDEX = -1;
let WOLVOX_ADI_INDEX = -1;
let WOLVOX_SOYADI_INDEX = -1;
let WOLVOX_GIRIS_INDEX = -1;
let WOLVOX_CIKIS_INDEX = -1;

const WOLVOX_ODA_NO_ROW_HEADERS = ["Oda No"];
const WOLVOX_ADI_ROW_HEADERS = ["Adý", "Adı"];
const WOLVOX_SOYADI_ROW_HEADERS = ["Soyadý", "Soyadı"];
const WOLVOX_GIRIS_ROW_HEADERS = ["Giriþ Tarihi", "Giriş Tarihi"];
const WOLVOX_CIKIS_ROW_HEADERS = ["Çýkýþ Tarihi", "Çıkış Tarihi"];

const KIMBIL_ODA_NO_INDEX = 9;
const KIMBIL_ADI_INDEX = 0;
const KIMBIL_SOYADI_INDEX = 7;
const KIMBIL_GIRIS_INDEX = 4;

const cellSeparators = [";", "\t", ","];

/**
 * @param {string} needle 
 * @param {string} haystack 
 * @return {number} how many times needle appears in haystack
 */
const countOccurences = (needle, haystack) => {
    let copiedHaystack = "" + haystack;
    let count = 0;
    const max = 1000;
    while (copiedHaystack.indexOf(needle) >= 0 && count < max) {
        const index = copiedHaystack.indexOf(needle);
        count++;
        copiedHaystack = copiedHaystack.substring(index + 1);
    }
    if (count === max) {
        throw Error("PROB");
    }
    return count;
}

/**
 * @param {string[]} lines The lines of the CSV file
 * @param {string} cellSeparator The separator symbol for which to compute the score
 * @return {number} the computed score. the higher, the better
 */
const cellSeparatorScore = (lines, cellSeparator) => {
    const amountMap = {};
    const amountList = [];
    for (let line of lines) {
        const count = countOccurences(cellSeparator, line);
        if (amountMap[count]) {
            amountMap[count]++;
        } else {
            amountMap[count] = 1;
        }
        amountList.push(count);
    }
    const amounts = Object.keys(amountMap);
    let score = amounts.length;
    if (amounts.length > 2) {
        score = -1 * amounts.length;
    }
    console.log("Cell separator", cellSeparator, "scored", score, "with", amounts, amountList);
    return score;
}

/**
 * @param {string[]} lines The lines of the CSV file
 * @return {string} cellSeparator The separator symbol for with the highest score
 */
const detectCellSeparator = (lines) => {
    const cellSeparatorScores = {};
    let highestScore = Number.MIN_VALUE;
    let cellSeparatorWithHighestScore = null;
    for (let cellSeparator of cellSeparators) {
        const score = cellSeparatorScore(lines, cellSeparator);
        cellSeparatorScores[cellSeparator] = score;
        if (score > highestScore) {
            highestScore = score;
            cellSeparatorWithHighestScore = cellSeparator;
        }
    }
    console.log("Chose cell separator", cellSeparatorWithHighestScore, "after analysis", cellSeparatorScores);
    return cellSeparatorWithHighestScore;
}

/**
 * Extracts raw csv into a [][].
 * @param {string} rawFileContent The raw file contents
 * @returns {array} A two-dimensional array with csv contents. 
 */
const extractCsv = (rawFileContent) => {
    const lines = rawFileContent.split("\n");
    const result = [];
    const cellSeparator = detectCellSeparator(lines);

    for (let line of lines) {
        const sub = line.split(cellSeparator);
        result.push(sub);
    }
    return result;
};

/**
 * Creates an entry object with given data.
 * @param {string} odaNo The room number
 * @param {string} adi The first name (with special characters)
 * @param {string} adi_simple The first name (without special characters)
 * @param {string} soyadi The last name (with special characters)
 * @param {string} soyadi_simple The last name (without special characters)
 * @param {string} giris A string representation of the date of arrival
 * @param {string} cikis A string representation of the date of departure
 * @returns {object} The entry object
 */
const toData = (odaNo, adi, adi_simple, soyadi, soyadi_simple, giris, cikis) => {
    return {
        odaNo: odaNo,
        adi: adi,
        soyadi: soyadi,
        giris: giris,
        cikis: cikis,
        adi_simple: adi_simple,
        soyadi_simple: soyadi_simple,
    };
};

/**
 * Converts a line from the wolvox csv into an entry object.
 * @param {array} line A line from the wolvox csv
 * @returns {object} The resulting entry object
 */
const wolvoxCsvToData = (line) => {
    if (line.length < 2) {
        return;
    }
    const result = toData(
        commonStringConvert(line[WOLVOX_ODA_NO_INDEX] + ""),
        commonStringConvert(line[WOLVOX_ADI_INDEX]),
        commonStringSimplify(line[WOLVOX_ADI_INDEX]),
        commonStringConvert(line[WOLVOX_SOYADI_INDEX]),
        commonStringSimplify(line[WOLVOX_SOYADI_INDEX]),
        commonStringSimplify(line[WOLVOX_GIRIS_INDEX]),
        line[WOLVOX_CIKIS_INDEX]);
    console.log("wolvox to data", result);
    return result;
};

/**
 * Converts a line from the kimbil csv into an entry object.
 * @param {array} line A line from the kimbil csv
 * @returns {object} The resulting entry object
 */
const kimbilCsvToData = (line) => {
    const result = toData(
        commonStringConvert(line[KIMBIL_ODA_NO_INDEX] + ""),
        commonStringConvert(line[KIMBIL_ADI_INDEX]),
        commonStringSimplify(line[KIMBIL_ADI_INDEX]),
        commonStringConvert(line[KIMBIL_SOYADI_INDEX]),
        commonStringSimplify(line[KIMBIL_SOYADI_INDEX]),
        line[KIMBIL_GIRIS_INDEX], "-");
    console.log("kimbil to data", result);
    return result;
};

const csvToDataFunctions = {};
csvToDataFunctions[KEY_CSV_KIMBIL] = kimbilCsvToData;
csvToDataFunctions[KEY_CSV_WOLVOX] = wolvoxCsvToData;

/**
 * Replaces all occurences of given string within other given string with third given string.
 * @param {string} input The string to work with
 * @param {string} shouldDisappear The segment that should no longer be in given string
 * @param {string} shouldAppear The segment to write into given string instead of occurences of other given string
 * @returns {string} The resulting string
 */
const replaceAll = (input, shouldDisappear, shouldAppear) => {
    if (!input) {
        return input;
    }
    let output = input;
    while (output.indexOf(shouldDisappear) >= 0) {
        output = output.replace(shouldDisappear, shouldAppear);
    }
    return output;
};

/**
 * Converts given string, removing spaces and correcting encoding issues.
 * @param {string} s The string to convert 
 * @returns {string} The resulting string
 */
const commonStringConvert = (s) => {
    if (!s) {
        return s;
    }
    s = replaceAll(s, " ", "");
    s = replaceAll(s, "\r", "");
    s = replaceAll(s, "Ý", "İ");
    s = replaceAll(s, "Þ", "Ş");
    s = replaceAll(s, "Ð", "Ğ");
    s = replaceAll(s, "˜", "İ");
    s = replaceAll(s, "ž", "Ş");
    s = replaceAll(s, "¦", "Ğ");
    s = replaceAll(s, "š", "Ü");
    s = replaceAll(s, "™", 'Ö');
    s = replaceAll(s, "€", 'Ç');
    return s;
};

/**
 * Simplifies given string, removing spaces and replacing special characters with their nearest simple neighbors.
 * @param {string} s The string to convert 
 * @returns {string} The resulting string
 */
const commonStringSimplify = (s) => {
    if (!s) {
        return s;
    }
    s = replaceAll(s, " ", "");
    s = replaceAll(s, "\r", "");
    s = replaceAll(s, "Ý", "I");
    s = replaceAll(s, "Þ", "S");
    s = replaceAll(s, "Ð", "G");
    s = replaceAll(s, "˜", "I");
    s = replaceAll(s, "ž", "S");
    s = replaceAll(s, "¦", "G");
    s = replaceAll(s, "š", "U");
    s = replaceAll(s, "™", 'O');
    s = replaceAll(s, "€", 'C');
    s = replaceAll(s, "Ü", "U");
    s = replaceAll(s, "Ö", 'O');
    s = replaceAll(s, "Ç", 'C');
    s = replaceAll(s, "Ğ", 'G');
    s = replaceAll(s, "İ", 'I');
    s = replaceAll(s, "Ä", 'A');
    s = replaceAll(s, "Ş", 'S');
    return s;
};

/**
 * Validates raw csv input for kimbil csv, also handling validation error display.
 * @param {string} lines The raw csv lines
 * @param {function} printValidationError The function for printing validation errors
 * @param {function} resetValidationError The function for resetting validation error display
 */
const kimbilCsvRawCsvValidationFunction = (lines, printValidationError, resetValidationError) => {
    console.log("Validating kimbil raw csv", lines);
    let err = false;
    resetValidationError(KEY_CSV_KIMBIL);
    if (lines[0][0] !== "Adi") {
        printValidationError(KEY_CSV_KIMBIL, `CSV file uploaded for kimbil is not valid: First row should be 'Adi', but is '${lines[0][0]}'!!`);
        err = true;
    }
    if (lines[0].length !== 10) {
        printValidationError(KEY_CSV_KIMBIL, `CSV file uploaded for kimbil is not valid: There should be 10 columns, but there are ${lines[0].length}!`);
        err = true;
    }
    if (!err) {
        resetValidationError(KEY_CSV_KIMBIL);
    }
};

/**
 * @param {string} needle 
 * @param {string[]} arrayOfHaystacks 
 * @return {boolean} whether the needle equals one of the haystacks
 */
const equalsOne = (needle, arrayOfHaystacks) => {
    for (let haystack of arrayOfHaystacks) {
        if (needle === haystack) {
            return true;
        }
    }
    return false;
}

/**
 * Validates raw csv input for wolvox csv, also handling validation error display.
 * @param {string} lines The raw csv lines
 * @param {function} printValidationError The function for printing validation errors
 * @param {function} resetValidationError The function for resetting validation error display
 */
const wolvoxCsvRawCsvValidationFunction = (lines, printValidationError, resetValidationError) => {
    console.log("Validating wolvox raw csv", lines);
    const firstLine = lines[0];
    let i = 0;
    for (let rowHeader of firstLine) {

        if (equalsOne(rowHeader, WOLVOX_ODA_NO_ROW_HEADERS)) {
            WOLVOX_ODA_NO_INDEX = i;
        } else if (equalsOne(rowHeader, WOLVOX_ADI_ROW_HEADERS)) {
            WOLVOX_ADI_INDEX = i;
        } else if (equalsOne(rowHeader, WOLVOX_SOYADI_ROW_HEADERS)) {
            WOLVOX_SOYADI_INDEX = i;
        } else if (equalsOne(rowHeader, WOLVOX_GIRIS_ROW_HEADERS)) {
            WOLVOX_GIRIS_INDEX = i;
        } else if (equalsOne(rowHeader, WOLVOX_CIKIS_ROW_HEADERS)) {
            WOLVOX_CIKIS_INDEX = i;
        } else {
            console.log("could not find matching rowHeader for", rowHeader);
        }

        i++;
    }
    let err = false;
    resetValidationError(KEY_CSV_WOLVOX);
    err = err || handleWolvoxRowError(WOLVOX_ODA_NO_INDEX, "Oda No", printValidationError);
    err = err || handleWolvoxRowError(WOLVOX_ADI_INDEX, "Ad", printValidationError);
    err = err || handleWolvoxRowError(WOLVOX_SOYADI_INDEX, "Soyad", printValidationError);
    err = err || handleWolvoxRowError(WOLVOX_GIRIS_INDEX, "Giris", printValidationError);
    err = err || handleWolvoxRowError(WOLVOX_CIKIS_INDEX, "Cikis", printValidationError);
    if (!err) {
        resetValidationError(KEY_CSV_WOLVOX);
    }
};

/**
 * Handles output to validation error field if row index is invalid.
 * @param {number} index The row index (result of detection algorithm)
 * @param {string} name The displayable name of the row
 * @param {function} printValidationError The function to use for printing to the validation error field
 * @returns true if the row index is invalid
 */
const handleWolvoxRowError = (index, name, printValidationError) => {
    if (index === -1) {
        printValidationError(KEY_CSV_WOLVOX, `CSV file uploaded for Wolvox is not valid: Could not find row header  ${name}!`);
        return true;
    }
    return false;
};

/**
 * For given key, returns the respective validation function.
 * @param {string} key The realm key, e.g. the WOLVOX key
 * @returns {function} The respective validation function.
 */
const csvRawCsvValidationFunctions = (key) => {
    switch (key) {
        case KEY_CSV_KIMBIL:
            return kimbilCsvRawCsvValidationFunction;
        case KEY_CSV_WOLVOX:
            return wolvoxCsvRawCsvValidationFunction;
        default:
            throw new Error("Key unknown: " + key);
    }
}

/**
 * Class handling conversion of data from CSV to entry object.
 */
export class DataConverter {
    /**
     * @param {function} printValidationErrorFunction The function for printing validation errors
     * @param {function} resetValidationErrorFunction The function for resetting validation error display
     */
    constructor(printValidationErrorFunction, resetValidationErrorFunction) {
        this.printValidationErrorFunction = printValidationErrorFunction;
        this.resetValidationErrorFunction = resetValidationErrorFunction;
    }

    /**
     * Converts CSV data into entry objects, dispatching events
     * for saving the resulting data.
     * @param {object} that The object containing the dispatch function
     * @returns {object} a container containing the converted data
     */
    convertAllCsvData(that) {
        let fullData = {};
        let dataKimbil = this.convertOneCsvData(that, KEY_CSV_KIMBIL);
        let dataWolvox = this.convertOneCsvData(that, KEY_CSV_WOLVOX);
        fullData[KEY_CSV_KIMBIL] = dataKimbil;
        fullData[KEY_CSV_WOLVOX] = dataWolvox;
        return fullData;
    }

    /**
     * Converts CSV data into entry objects for one realm, dispatching an event
     * for saving the resulting data.
     * @param {object} that The object containing the dispatch function
     * @param {string} key The realm key for which to carry out the process
     * @returns {array} the converted data
     */
    convertOneCsvData(that, key) {
        const raw = that.rawData[key];
        if (raw) {
            const fullData = [];
            const data = extractCsv(raw);
            csvRawCsvValidationFunctions(key)(data, this.printValidationErrorFunction, this.resetValidationErrorFunction);
            console.log(key, "raw", data);
            let isFirst = true;
            for (let entry of data) {
                if (isFirst) {
                    isFirst = false;
                    console.log("Skipping first", entry);
                    continue;
                }
                if (entry.length < 2) {
                    console.log("Skipping empty", entry);
                    continue;
                }
                const compiled = csvToDataFunctions[key](entry);
                fullData.push(compiled);
            }
            let maxOdaNoLength = 0;
            fullData.forEach(data => {
                if(maxOdaNoLength < data.odaNo.length) {
                    maxOdaNoLength = data.odaNo.length;
                }
            });
            fullData.forEach(data => {
                while(maxOdaNoLength > data.odaNo.length) {
                    data.odaNo = `0${data.odaNo}`;
                }
            });
            console.log(key, "full", fullData);
            fullData.sort((a, b) => {
                // soyadi, adi
                if (a.soyadi_simple === b.soyadi_simple && a.odaNo === b.odaNo) {
                    return stringCompare(a.adi_simple, b.adi_simple);
                }
                if (a.odaNo === b.odaNo) {
                    return stringCompare(a.soyadi_simple, b.soyadi_simple);
                }
                return stringCompare(a.odaNo, b.odaNo);
            });
            console.log(key, "full sorted", fullData);
            that.props.dispatch(eventMaker(key, fullData));
            return fullData;
        }
    }
}