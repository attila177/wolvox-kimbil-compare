import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX, isNumberlike } from './common';
import { stringCompare } from './compare';
import { eventMaker } from './reducers/reducer';
import { extractCsv } from './csv';
import { consoleMock } from './commontest';
import FIELDS from './guest-data';
const logger = consoleMock;

/** @typedef {import('./common').DataSourceTypeKey} DataSourceTypeKey */

/** @type {{[typeKey: string]: {[keyKey: string]: string[]}}} */
const ROW_HEADERS = {
    [KEY_CSV_KIMBIL]: {
        odaNo: ['VerilenOda'],
        adi: ['Adi'],
        soyadi: ['Soyadi'],
        giris: ['GelisTarihi'],
        cikis: [],
        gecerliBelge: ['GecerliBelge'],
        kimlikNo: ['KimlikNo'],
        uyruk: ['UAdi']
    },
    [KEY_CSV_WOLVOX]: {
        odaNo: ['Oda No', 'OdaNo'],
        adi: ['Adý', 'Adı', 'Ad�', 'Adï¿½'],
        soyadi: ['Soyadý', 'Soyadı', 'Soyad�', 'Soyadï¿½'],
        giris: ['Giriþ Tarihi', 'Giriş Tarihi', 'Giri� Tarihi', 'Giriï¿½Tarihi'],
        cikis: ['Çýkýþ Tarihi', 'Çıkış Tarihi', '��k�� Tarihi', 'ï¿½ï¿½kï¿½ï¿½Tarihi'],
        gecerliBelge: ['H�viyet No', 'Hüviyet No', 'Hï¿½viyetNo'],
        kimlikNo: ['TC Kimlik No', 'TCKimlikNo'],
        uyruk: ['Uyruğu', 'Uyru�u', 'Uyruðu']
    },
}

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
 * @param {import('./convert').GuestEntry} entry 
 */
const getIdentityNo = (entry) => {
    if (!entry.uyruk) {
      const guess = entry.kimlikNo || entry.gecerliBelge || ''; 
      if (entry.kimlikNo && entry.gecerliBelge) {
        logger.warn(`Guessing identity no ${guess} for`, entry);
      }
      return guess;
    } else if (entry.uyruk === 'TÜRKİYE' || entry.uyruk === 'TC') {
        return entry.kimlikNo || '';
    } else {
        return entry.gecerliBelge || '';
    }
}

/**
 * Creates an entry object with given data.
 * @param {GuestEntryInput} param0
 * @returns {GuestEntry} The entry object
 */
const toData = ({odaNo, adi, adi_simple, soyadi, soyadi_simple, giris, cikis, gecerliBelge, kimlikNo, uyruk}) => {
    const isValid = !!(adi && soyadi);
    /** @type {GuestEntry} */
    const stub = {
        odaNo,
        adi,
        soyadi,
        giris,
        cikis,
        adi_simple,
        soyadi_simple,
        isValid,
        gecerliBelge,
        kimlikNo,
        uyruk
    };
    stub.identityNo = getIdentityNo(stub);
    return stub;
};



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
    // s = replaceAll(s, "ï¿½", 'ı');
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
    s = replaceAll(s, "�", 'U');
    return s;
};

/**
 * Validates raw csv input for kimbil csv, also handling validation error display.
 * @param {string[][]} lines The raw csv lines
 * @param {function} printValidationError The function for printing validation errors
 * @param {function} resetValidationError The function for resetting validation error display
 */
const kimbilCsvRawCsvValidationFunction = (lines, printValidationError, resetValidationError) => {
    // console.log("Validating kimbil raw csv", lines);
    let err = false;
    resetValidationError(KEY_CSV_KIMBIL);
    if (lines[0][0] !== "Adi") {
        printValidationError(KEY_CSV_KIMBIL, `CSV file uploaded for kimbil is not valid: First row should be 'Adi', but is '${lines[0][0]}'!!`);
        err = true;
    }
    if (lines[0].length !== 9) {
        printValidationError(KEY_CSV_KIMBIL, `CSV file uploaded for kimbil is not valid: There should be 9 columns, but there are ${lines[0].length}!`);
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
 * Class handling conversion of data from CSV to entry object.
 */
export class DataConverter {
    /**
     * @param {function} printValidationErrorFunction The function for printing validation errors
     * @param {function} resetValidationErrorFunction The function for resetting validation error display
     * @param {DataSourceTypeKey} dataSourceTypeKey
     * @param {string} rawCsvContent
     */
    constructor(printValidationErrorFunction, resetValidationErrorFunction, dataSourceTypeKey, rawCsvContent) {
        this.printValidationErrorFunction = printValidationErrorFunction;
        this.resetValidationErrorFunction = resetValidationErrorFunction;
        this.dataSourceTypeKey = dataSourceTypeKey;
        /** @type {{[key: string]: number}} */
        this.indices = {};
        this.validateFn = this.csvRawCsvValidationFunctions();
        this.toDataFunction = this.csvToDataFunctions();
        this.rawCsvContent = rawCsvContent;
        if (this.rawCsvContent) {
            /** @type {string[][]} */
            this.dataMatrix = extractCsv(this.rawCsvContent);
            this.initializeIndices();
        }
    }

    /**
     * @param {DataSourceTypeKey} dataSourceTypeKey 
     * @param {string[]} firstLineCells 
     */
    initializeIndices () {
        if (!this.dataMatrix[0]) {
            logger.error('Error')
            return;
        }
        const headerCells = this.dataMatrix[0]
        headerCells.forEach((cellContent, index) => {
            const match = Object.keys(FIELDS).find((name) => {
                return equalsOne(cellContent, ROW_HEADERS[this.dataSourceTypeKey][name])
            });
            if (match) {
                this.indices[match] = index;
            } else {
                // logger.log("could not find matching rowHeader for", cellContent, 'in', this.dataSourceTypeKey);
            }
        });
        const requiredFieldsNames = Object.entries(FIELDS).filter(([_name, props]) => props.required).map(([name, _props]) => name);
        const missing = requiredFieldsNames.filter((name) => this.indices[name] === undefined);
        if (missing.length) {
            throw new Error(`No index found for required rows ${missing} in ${headerCells}`);
        }
    }

    /**
     * Converts a line from the kimbil csv into an entry object.
     * @param {string[]} line A line from the kimbil csv
     * @returns The resulting entry object
     */
    kimbilCsvToData (line) {
        const adi = line[this.indices.adi];
        const soyadi = line[this.indices.soyadi];
        const odaRaw = line[this.indices.odaNo];
        const odaNo = commonStringConvert(odaRaw + "");
        const result = toData({
            odaNo,
            adi: commonStringConvert(adi),
            adi_simple: commonStringSimplify(adi),
            soyadi: commonStringConvert(soyadi),
            soyadi_simple: commonStringSimplify(soyadi),
            giris: line[this.indices.giris],
            cikis: "-",
            gecerliBelge: commonStringConvert(line[this.indices.gecerliBelge]),
            kimlikNo: commonStringConvert(line[this.indices.kimlikNo]),
            uyruk: commonStringConvert(line[this.indices.uyruk]),
        });
        logger.log("kimbil to data", result);
        return result;
    }

    /**
     * Converts a line from the wolvox csv into an entry object.
     * @param {string[]} line A line from the wolvox csv
     * @returns The resulting entry object
     */
    wolvoxCsvToData (line) {
        if (line.length < 2) {
            return;
        }
        const adi = line[this.indices.adi];
        const soyadi = line[this.indices.soyadi];
        const result = toData({
            odaNo: commonStringConvert(line[this.indices.odaNo] + ""),
            adi: commonStringConvert(adi),
            adi_simple: commonStringSimplify(adi),
            soyadi: commonStringConvert(soyadi),
            soyadi_simple: commonStringSimplify(soyadi),
            giris: commonStringConvert(line[this.indices.giris]),
            cikis: commonStringConvert(line[this.indices.cikis]),
            gecerliBelge: commonStringConvert(line[this.indices.gecerliBelge]),
            kimlikNo: commonStringConvert(line[this.indices.kimlikNo]),
            uyruk: commonStringConvert(line[this.indices.uyruk])
            });
        logger.log("wolvox to data", result);
        return result;
    };

    csvToDataFunctions () {
        switch (this.dataSourceTypeKey) {
            case KEY_CSV_KIMBIL: return this.kimbilCsvToData;
            case KEY_CSV_WOLVOX: return this.wolvoxCsvToData;
            default: throw new Error('could not find csv to data function');
        }
    };

    csvRawCsvValidationFunctions () {
        switch (this.dataSourceTypeKey) {
            case KEY_CSV_KIMBIL: return kimbilCsvRawCsvValidationFunction;
            case KEY_CSV_WOLVOX: return this.wolvoxCsvRawCsvValidationFunction;
            default: throw new Error('could not find csv validation function');
        }
    };

    /**
     * Validates raw csv input for wolvox csv, also handling validation error display.
     * @param {string[][]} lines The raw csv lines
     * @param {function} printValidationError The function for printing validation errors
     * @param {function} resetValidationError The function for resetting validation error display
     */
    wolvoxCsvRawCsvValidationFunction (lines, printValidationError, resetValidationError) {
        logger.log("Validating wolvox raw csv", lines);
        let err = false;
        resetValidationError(KEY_CSV_WOLVOX);
        err = err || handleWolvoxRowError(this.indices.odaNo, "Oda No", printValidationError);
        err = err || handleWolvoxRowError(this.indices.adi, "Ad", printValidationError);
        err = err || handleWolvoxRowError(this.indices.soyadi, "Soyad", printValidationError);
        err = err || handleWolvoxRowError(this.indices.giris, "Giris", printValidationError);
        err = err || handleWolvoxRowError(this.indices.cikis, "Cikis", printValidationError);
        if (!err) {
            resetValidationError(KEY_CSV_WOLVOX);
        }
    };

    /**
     * Converts CSV data into entry objects for one realm, dispatching an event
     * for saving the resulting data.
     * @param {import('./App').MainApp} that The object containing the dispatch function
     * @returns {array} the converted data
     */
    convertOneCsvData(that) {
        if (this.dataMatrix) {
            const fullData = [];
            this.validateFn(this.dataMatrix, this.printValidationErrorFunction, this.resetValidationErrorFunction);
            logger.log(this.dataSourceTypeKey, "raw", this.dataMatrix);
            let isFirst = true;
            for (let entry of this.dataMatrix) {
                if (isFirst) {
                    isFirst = false;
                    logger.log("Skipping first", entry);
                    continue;
                }
                if (entry.length < 2) {
                    logger.log("Skipping empty", entry);
                    continue;
                }
                const compiled = this.toDataFunction(entry);
                if(compiled.isValid) {
                    fullData.push(compiled);
                } else {
                    logger.warn(`Not adding invalid line to data set: ${entry.join(', ')}`);
                }
            }
            let maxOdaNoLength = 0;
            fullData.forEach(data => {
                if(isNumberlike(data.odaNo) && maxOdaNoLength < data.odaNo.length) {
                    maxOdaNoLength = data.odaNo.length;
                }
            });
            fullData.forEach(data => {
                while(maxOdaNoLength > data.odaNo.length) {
                    data.odaNo = `0${data.odaNo}`;
                }
            });
            logger.log(this.dataSourceTypeKey, "full", fullData);
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
            logger.log(this.dataSourceTypeKey, "full sorted", fullData);
            that.props.dispatch(eventMaker(this.dataSourceTypeKey, fullData));
            return fullData;
        }
    }
}