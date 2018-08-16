import { debug, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { stringCompare } from './compare';
import { eventMaker } from './reducers/reducer';

const WOLVOX_ODA_NO_INDEX = 0;
const WOLVOX_ADI_INDEX = 4;
const WOLVOX_SOYADI_INDEX = 5;
const WOLVOX_GIRIS_INDEX = 8;
const WOLVOX_CIKIS_INDEX = 10;

const KIMBIL_ODA_NO_INDEX = 9;
const KIMBIL_ADI_INDEX = 0;
const KIMBIL_SOYADI_INDEX = 7;
const KIMBIL_GIRIS_INDEX = 4;

const extractCsv = (raw) => {
    const lines = raw.split("\n");
    const result = [];
    for (let line of lines) {
        const sub = line.split(";");
        result.push(sub);
    }
    return result;
};

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
    debug("wolvox to data", result);
    return result;
};

const kimbilCsvToData = (line) => {
    const result = toData(
        commonStringConvert(line[KIMBIL_ODA_NO_INDEX] + ""),
        commonStringConvert(line[KIMBIL_ADI_INDEX]),
        commonStringSimplify(line[KIMBIL_ADI_INDEX]),
        commonStringConvert(line[KIMBIL_SOYADI_INDEX]),
        commonStringSimplify(line[KIMBIL_SOYADI_INDEX]),
        line[KIMBIL_GIRIS_INDEX], "-");
    debug("kimbil to data", result);
    return result;
};

const csvToDataFunctions = {};
csvToDataFunctions[KEY_CSV_KIMBIL] = kimbilCsvToData;
csvToDataFunctions[KEY_CSV_WOLVOX] = wolvoxCsvToData;



const replaceAll = (input, shouldDisappear, shouldAppear) => {
    let output = input;
    while (output.indexOf(shouldDisappear) >= 0) {
        output = output.replace(shouldDisappear, shouldAppear);
    }
    return output;
};

const commonStringConvert = (s) => {
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

const commonStringSimplify = (s) => {
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
    return s;
};

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

const wolvoxCsvRawCsvValidationFunction = (lines, printValidationError, resetValidationError) => {
    console.log("Validating wolvox raw csv", lines);
    let err = false;
    resetValidationError(KEY_CSV_WOLVOX);
    if (lines[0][0] !== "Oda No") {
        printValidationError(KEY_CSV_WOLVOX, `CSV file uploaded for Wolvox is not valid: First row should be 'Oda No', but is '${lines[0][0]}'!`);
        err = true;
    }
    if (lines[0].length !== 65) {
        printValidationError(KEY_CSV_WOLVOX, `CSV file uploaded for Wolvox is not valid: There should be 65 columns, but there are ${lines[0].length}!`);
        err = true;
    }
    if (!err) {
        resetValidationError(KEY_CSV_WOLVOX);
    }
};

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

export class DataConverter {
    constructor(printValidationErrorFunction, resetValidationErrorFunction) {
        this.printValidationErrorFunction = printValidationErrorFunction;
        this.resetValidationErrorFunction = resetValidationErrorFunction;
    }

    convertAllCsvData(that) {
        let fullData = {};
        let dataKimbil = this.convertOneCsvData(that, KEY_CSV_KIMBIL);
        let dataWolvox = this.convertOneCsvData(that, KEY_CSV_WOLVOX);
        fullData[KEY_CSV_KIMBIL] = dataKimbil;
        fullData[KEY_CSV_WOLVOX] = dataWolvox;
        return fullData;
    }

    convertOneCsvData(that, key) {
        const raw = that.rawData[key];
        if (raw) {
            const fullData = [];
            const data = extractCsv(raw);
            csvRawCsvValidationFunctions(key)(data, this.printValidationErrorFunction, this.resetValidationErrorFunction);
            debug(key, "raw", data);
            let isFirst = true;
            for (let entry of data) {
                if (isFirst) {
                    isFirst = false;
                    debug("Skipping first", entry);
                    continue;
                }
                if (entry.length < 2) {
                    debug("Skipping empty", entry);
                    continue;
                }
                const compiled = csvToDataFunctions[key](entry);
                fullData.push(compiled);
            }
            debug(key, "full", fullData);
            fullData.sort((a, b) => {
                // soyadi, adi
                if (a.soyadi_simple === b.soyadi_simple) {
                    return stringCompare(a.adi_simple, b.adi_simple);
                }
                return stringCompare(a.soyadi_simple, b.soyadi_simple);
            });
            console.log(key, "full sorted", fullData);
            that.props.dispatch(eventMaker(key, fullData));
            return fullData;
        }
    }
}