import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const DATA_ENTRY_AMOUNT_PREFIX = "data-entry-amount-";
const DATA_HOLDER_DIV_PREFIX = "data-holder-";
const VALIDATION_ERROR_HOLDER = "validation-error-holder";

const KEY_CSV_WOLVOX = "csv-wolvox";
const KEY_CSV_KIMBIL = "csv-kimbil";

const WOLVOX_ODA_NO_INDEX = 0;
const WOLVOX_ADI_INDEX = 4;
const WOLVOX_SOYADI_INDEX = 5;
const WOLVOX_GIRIS_INDEX = 8;
const WOLVOX_CIKIS_INDEX = 10;

const KIMBIL_ODA_NO_INDEX = 9;
const KIMBIL_ADI_INDEX = 0;
const KIMBIL_SOYADI_INDEX = 7;
const KIMBIL_GIRIS_INDEX = 4;

const output_debug = false;
const debug = () => {
  if (!output_debug) {
    return;
  }
  let toLog = "";
  for (let arg of arguments) {
    toLog += ((typeof arg === "string") ? arg : JSON.stringify(arg));
  }
  console.log(toLog);
};

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

const printValidationError = (key, msg) => {
  const oldMsg = document.getElementById(VALIDATION_ERROR_HOLDER + key).innerHTML;
  console.warn("validation error", key, msg);
  document.getElementById(VALIDATION_ERROR_HOLDER + key).innerHTML = oldMsg + " <br> " + msg;
};

const resetValidationError = (key) => {
  document.getElementById(VALIDATION_ERROR_HOLDER + key).innerHTML = "";
};

const kimbilCsvRawCsvValidationFunction = (lines) => {
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

const wolvoxCsvRawCsvValidationFunction = (lines) => {
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

const csvRawCsvValidationFunctions = {};
csvRawCsvValidationFunctions[KEY_CSV_KIMBIL] = kimbilCsvRawCsvValidationFunction;
csvRawCsvValidationFunctions[KEY_CSV_WOLVOX] = wolvoxCsvRawCsvValidationFunction;

const replaceAll = (input, shouldDisappear, shouldAppear) => {
  let output = input;
  while (output.indexOf(shouldDisappear) >= 0) {
    output = output.replace(shouldDisappear, shouldAppear);
  }
  return output;
};

const contains = (container, contained) => {
  return container.indexOf(contained) >= 0;
};

const commonStringConvert = (s) => {
  s = replaceAll(s, " ", "");
  s = replaceAll(s, "\r", "");
  s = replaceAll(s, "Ý", "&#304;");
  s = replaceAll(s, "Þ", "&#350;");
  s = replaceAll(s, "Ð", "&#286;");
  s = replaceAll(s, "˜", "&#304;");
  s = replaceAll(s, "ž", "&#350;");
  s = replaceAll(s, "¦", "&#286;");
  s = replaceAll(s, "š", "&Uuml;");
  s = replaceAll(s, "™", '&Ouml;');
  s = replaceAll(s, "€", '&Ccedil;');
  s = replaceAll(s, "Ü", "&Uuml;");
  s = replaceAll(s, "Ö", '&Ouml;');
  s = replaceAll(s, "Ç", '&Ccedil;');
  s = replaceAll(s, "Ğ", '&#286;');
  s = replaceAll(s, "İ", '&#304;');
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

const stringCompare = (a, b) => {
  return ('' + a).localeCompare(b + '');
};

const convertOneCsvData = (that, key) => {
  const raw = that.rawData[key];
  if (raw) {
    that.fullData[key] = [];
    const data = extractCsv(raw);
    csvRawCsvValidationFunctions[key](data);
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
      that.fullData[key].push(compiled);
    }
    debug(key, "full", that.fullData[key]);
    that.fullData[key].sort((a, b) => {
      // soyadi, adi
      if (a.soyadi_simple === b.soyadi_simple) {
        return stringCompare(a.adi_simple, b.adi_simple);
      }
      return stringCompare(a.soyadi_simple, b.soyadi_simple);
    });
    console.log(key, "full sorted", that.fullData[key]);
    document.getElementById(DATA_ENTRY_AMOUNT_PREFIX + key).textContent = `${key} has ${that.fullData[key].length} entries!`;
  }
};

const convertAllCsvData = (that) => {
  convertOneCsvData(that, KEY_CSV_KIMBIL);
  convertOneCsvData(that, KEY_CSV_WOLVOX);
};

const resemble = (s1, s2) => {
  return s1 === s2 || contains(s1, s2) || contains(s2, s1);
};

const compareEntries = (baseEntry, otherEntry) => {
  const oda = resemble(baseEntry.odaNo, otherEntry.odaNo);
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

const compareOne = (that, key, otherKey) => {
  const baseData = that.fullData[key];
  const otherData = that.fullData[otherKey];

  if (baseData && otherData) {
    const notInOther = [];
    for (let baseEntry of baseData) {
      let found = false;
      for (let otherEntry of otherData) {
        if (compareEntries(baseEntry, otherEntry)) {
          found = true;
          break;
        }
      }
      if (!found) {
        notInOther.push(baseEntry);
        baseEntry.notInOther = true;
      } else {
        baseEntry.notInOther = false;
      }
    }
    console.log("not in other ", key, notInOther.length, "of", baseData.length);

    const holder = document.getElementById(DATA_HOLDER_DIV_PREFIX + key);
    let trs = "";
    for (let entry of that.fullData[key]) {
      trs += `<tr${entry.notInOther ? " style=\"background-color:red;\"" : ""}><td>${entry.odaNo}</td><td>${entry.adi}</td><td>${entry.soyadi}</td></tr>`;
    }
    const table = `<table><tbody>${trs}</tbody></table>`;
    holder.innerHTML = table;
  }
};

const compareAllCsvData = (that) => {
  compareOne(that, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX);
  compareOne(that, KEY_CSV_WOLVOX, KEY_CSV_KIMBIL);
};

class App extends Component {

  constructor(props) {
    super();
    this.rawData = {};
    this.fullData = {};
  }

  fileReader(id) {
    if (!this.rawData) {
      this.rawData = {};
    }
    let rawData = this.rawData;
    const that = this;
    const read = (inPar1) => {
      const file = inPar1.target.files[0];
      console.log("File metadata", file);
      const reader = new FileReader();
      reader.readAsText(file, 'ISO-8859-1');
      reader.onload = function (evt) {
        console.log("Read file:", evt.target.result);
        rawData[id] = evt.target.result;
        document.getElementById(`{id}-present`).textContent = "Loaded.";
        convertAllCsvData(that);
        compareAllCsvData(that);
      }
      reader.onerror = function (evt) {
        console.log("error", evt);
      }
    };
    const dataIsPresent = <div id={`{id}-present`} ></div >;
    return <div>{id}: <br /><input type="file" id={id} onChange={read} /> {dataIsPresent} <br />
      <span id={`${DATA_ENTRY_AMOUNT_PREFIX}${id}`}></span></div>;
  }

  dataHolderDiv(key) {
    return <div className="holder" id={`${DATA_HOLDER_DIV_PREFIX}${key}`}></div>;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Wolvox Kimbil Compare</h1>
        </header>
        <div className="red" id={`${VALIDATION_ERROR_HOLDER}${KEY_CSV_WOLVOX}`}></div>
        <div className="red" id={`${VALIDATION_ERROR_HOLDER}${KEY_CSV_KIMBIL}`}></div>
        <table className="full">
          <tbody>
            <tr>
              <td>{this.fileReader(KEY_CSV_WOLVOX)}</td>
              <td>{this.fileReader(KEY_CSV_KIMBIL)}</td>
            </tr>
            <tr>
              <td>{this.dataHolderDiv(KEY_CSV_WOLVOX)}</td>
              <td>{this.dataHolderDiv(KEY_CSV_KIMBIL)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
