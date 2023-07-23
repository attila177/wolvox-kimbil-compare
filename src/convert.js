import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX, isEmptyCaravan, isNumberlike, isTurkishCitizen } from './common';
import { stringCompare } from './compare';
import { eventMaker } from './reducers/reducer';
import { extractCsv } from './csv';
import { logger } from './common';
import FIELDS from './guest-data';
import { mimicIdentityNoAnonymization, mimicNameAnonymization, reduceStars } from './emniyet-tools';

/** @typedef {import('./common').DataSourceTypeKey} DataSourceTypeKey */
/** @typedef {import('./common').GuestEntry} GuestEntry */
/** @typedef {import('./common').GuestEntryInput} GuestEntryInput */

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
        uyruk: ['UAdi'],
        not: []
    },
    [KEY_CSV_WOLVOX]: {
        odaNo: ['Oda No', 'OdaNo'],
        adi: ['Adý', 'Adı', 'Ad�', 'Adï¿½'],
        soyadi: ['Soyadý', 'Soyadı', 'Soyad�', 'Soyadï¿½'],
        giris: ['Giriþ Tarihi', 'Giriş Tarihi', 'Giri� Tarihi', 'Giriï¿½Tarihi'],
        cikis: ['Çýkýþ Tarihi', 'Çıkış Tarihi', '��k�� Tarihi', 'ï¿½ï¿½kï¿½ï¿½Tarihi'],
        gecerliBelge: ['H�viyet No', 'Hüviyet No', 'Hï¿½viyetNo'],
        kimlikNo: ['TC Kimlik No', 'TCKimlikNo'],
        uyruk: ['Uyruğu', 'Uyru�u', 'Uyruðu'],
        not: ['Rez. Not 1']
    },
}

/**
 * @param {GuestEntry} entry 
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
 * @param {GuestEntry} entry 
 */
const getIdentityNoSimple = (entry) => {
    if (!entry.uyruk) {
      const guess = entry.kimlikNo_simple || entry.gecerliBelge_simple || ''; 
      if (entry.kimlikNo_simple && entry.gecerliBelge_simple) {
        logger.warn(`Guessing identity no (simple) ${guess} for`, entry);
      }
      return guess;
    } else if (entry.uyruk === 'TÜRKİYE' || entry.uyruk === 'TC') {
        return entry.kimlikNo_simple || '';
    } else {
        return entry.gecerliBelge_simple || '';
    }
}

/** @param {string} inStr */
const shortenDate = (inStr) => {
    if (!inStr) {
        return inStr;
    }
    // wolvox has format 'D.MM.YYYY' while kimbil has format 'D.MM.YYYY H:mm:SS'
    const withoutTime = inStr.split(' ')[0];
    return withoutTime.split('.').filter((_s, i) => i <= 1).join('.') + '.';
}

/**
 * Creates an entry object with given data.
 * @param {GuestEntryInput} param0
 * @returns {GuestEntry} The entry object
 */
const toData = ({odaNo, adi, adi_simple, soyadi, soyadi_simple, giris, cikis, gecerliBelge, gecerliBelge_simple, kimlikNo, kimlikNo_simple, uyruk, not}) => {
    const isValid = !!(adi && soyadi);
    /** @type {GuestEntry} */
    const stub = {
        odaNo,
        adi,
        soyadi,
        giris: shortenDate(giris),
        cikis,
        adi_simple,
        soyadi_simple,
        isValid,
        gecerliBelge_simple,
        gecerliBelge,
        kimlikNo,
        kimlikNo_simple,
        uyruk,
        not,
    };
    stub.isEmptyCaravan = isEmptyCaravan(stub);
    stub.isTurkishCitizen = isTurkishCitizen(stub);
    stub.identityNo = getIdentityNo(stub);
    stub.identityNo_simple = getIdentityNoSimple(stub);
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
    return s.toUpperCase();
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
        const kimlikNo = commonStringConvert(line[this.indices.kimlikNo]);
        const gecerliBelge = commonStringConvert(line[this.indices.gecerliBelge]);
        const result = toData({
            odaNo,
            adi: commonStringConvert(adi),
            adi_simple: reduceStars(commonStringSimplify(adi)),
            soyadi: commonStringConvert(soyadi),
            soyadi_simple: reduceStars(commonStringSimplify(soyadi)),
            giris: line[this.indices.giris],
            cikis: "-",
            gecerliBelge,
            gecerliBelge_simple: reduceStars(gecerliBelge),
            kimlikNo,
            kimlikNo_simple: reduceStars(kimlikNo),
            uyruk: commonStringConvert(line[this.indices.uyruk]),
            not: undefined,
        });
        logger.debug("kimbil to data", result);
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
        const kimlikNo = commonStringConvert(line[this.indices.kimlikNo]);
        const gecerliBelge = commonStringConvert(line[this.indices.gecerliBelge]);
        const result = toData({
            odaNo: commonStringConvert(line[this.indices.odaNo] + ""),
            adi: commonStringConvert(adi),
            adi_simple: mimicNameAnonymization(commonStringSimplify(adi)),
            soyadi: commonStringConvert(soyadi),
            soyadi_simple: mimicNameAnonymization(commonStringSimplify(soyadi)),
            giris: commonStringConvert(line[this.indices.giris]),
            cikis: commonStringConvert(line[this.indices.cikis]),
            gecerliBelge,
            gecerliBelge_simple: mimicIdentityNoAnonymization(gecerliBelge),
            kimlikNo,
            kimlikNo_simple: mimicIdentityNoAnonymization(kimlikNo),
            uyruk: commonStringConvert(line[this.indices.uyruk]),
            not: commonStringConvert(line[this.indices.not]),
            });
        logger.debug("wolvox to data", result);
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
            /** @type {GuestEntry[]} */
            const fullData = [];
            this.validateFn(this.dataMatrix, this.printValidationErrorFunction, this.resetValidationErrorFunction);
            logger.debug(this.dataSourceTypeKey, "raw", this.dataMatrix);
            let isFirst = true;
            for (let entry of this.dataMatrix) {
                if (isFirst) {
                    isFirst = false;
                    logger.debug("Skipping first", entry);
                    continue;
                }
                if (entry.length < 2) {
                    logger.debug("Skipping empty", entry);
                    continue;
                }
                const compiled = this.toDataFunction(entry);
                if(compiled.isValid) {
                    fullData.push(compiled);
                } else {
                    logger.warn(`[${this.dataSourceTypeKey}][room ${compiled.odaNo}] Not adding invalid line to data set: ${entry.join('; ')}`);
                }
            }
            let maxOdaNoLength = 0;
            fullData.forEach(data => {
                data.paddedOdaNo = data.odaNo;
                if(isNumberlike(data.odaNo) && maxOdaNoLength < data.odaNo.length) {
                    maxOdaNoLength = data.odaNo.length;
                }
            });
            fullData.forEach(data => {
                while(maxOdaNoLength > data.paddedOdaNo.length) {
                    data.paddedOdaNo = `0${data.paddedOdaNo}`;
                }
            });
            logger.debug(this.dataSourceTypeKey, "full", fullData);
            fullData.sort((a, b) => {
                // soyadi, adi
                if (a.soyadi_simple === b.soyadi_simple && a.paddedOdaNo === b.paddedOdaNo) {
                    return stringCompare(a.adi_simple, b.adi_simple);
                }
                if (a.paddedOdaNo === b.paddedOdaNo) {
                    return stringCompare(a.soyadi_simple, b.soyadi_simple);
                }
                return stringCompare(a.paddedOdaNo, b.paddedOdaNo);
            });
            logger.debug(this.dataSourceTypeKey, "full sorted", fullData);
            that.props.dispatch(eventMaker(this.dataSourceTypeKey, fullData));
            return fullData;
        }
    }
}