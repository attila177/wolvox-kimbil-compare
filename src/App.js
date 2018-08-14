import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import List from './List';
import { connect } from 'react-redux';
import { eventMaker } from './reducers/reducer.js';
import { stringCompare, compareAllCsvData } from './compare';
import { debug, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';

const VALIDATION_ERROR_HOLDER = "validation-error-holder";

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

const convertOneCsvData = (that, key) => {
  const raw = that.rawData[key];
  if (raw) {
    const fullData = [];
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
};

const convertAllCsvData = (that) => {
  let fullData = {};
  let dataKimbil = convertOneCsvData(that, KEY_CSV_KIMBIL);
  let dataWolvox = convertOneCsvData(that, KEY_CSV_WOLVOX);
  fullData[KEY_CSV_KIMBIL] = dataKimbil;
  fullData[KEY_CSV_WOLVOX] = dataWolvox;
  return fullData;
};

class App extends Component {

  constructor(props) {
    super();
    this.rawData = {};
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
        let fullData = convertAllCsvData(that);
        compareAllCsvData(that, fullData);
      }
      reader.onerror = function (evt) {
        console.log("error", evt);
      }
    };
    const dataIsPresent = <div id={`{id}-present`} ></div >;
    return <div>{id}: <br /><input type="file" id={id} onChange={read} /> {dataIsPresent} <br />
    </div>;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Wolvox Kimbil Compare</h1>
        </header>
        Error colors:<br />
        <span style={{ backgroundColor: "red" }}>Unknown problem</span> &nbsp;
        <span style={{ backgroundColor: "yellow" }}>Entry with max 2 different letters in first and last name found</span> &nbsp;
        <span style={{ backgroundColor: "fuchsia" }}>Entry with same room number and first name found</span>
        <br />
        <div className="red" id={`${VALIDATION_ERROR_HOLDER}${KEY_CSV_WOLVOX}`}></div>
        <div className="red" id={`${VALIDATION_ERROR_HOLDER}${KEY_CSV_KIMBIL}`}></div>
        <table className="full">
          <tbody>
            <tr>
              <td>{this.fileReader(KEY_CSV_WOLVOX)}</td>
              <td>{this.fileReader(KEY_CSV_KIMBIL)}</td>
            </tr>
            <tr>
              <td><List sourceKey={KEY_CSV_WOLVOX} /></td>
              <td><List sourceKey={KEY_CSV_KIMBIL} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = function (state, props) {
  return {};
};

const mapDispatchToProps = function (dispatch) {
  return { dispatch: dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
