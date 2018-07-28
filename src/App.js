import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const EXISTS_HERE_BUT_NOT_OTHER_PREFIX = "exists-here-but-not-other-";
const DATA_ENTRY_AMOUNT_PREFIX = "data-entry-amount-";
const DATA_HOLDER_DIV_PREFIX = "data-holder-";

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

const extractCsv = (raw) => {
  const lines = raw.split("\n");
  const result = [];
  for (let line of lines) {
    const sub = line.split(";");
    result.push(sub);
  }
  return result;
};

const toData = (odaNo, adi, soyadi, giris, cikis) => {
  return {
    odaNo: odaNo,
    adi: adi,
    soyadi: soyadi,
    giris: giris,
    cikis: cikis,
  };
};

const wolvoxCsvToData = (line) => {
  if (line.length < 2) {
    return;
  }
  const result = toData(
    wolvoxStringConvert(line[WOLVOX_ODA_NO_INDEX] + ""),
    wolvoxStringConvert(line[WOLVOX_ADI_INDEX]),
    wolvoxStringConvert(line[WOLVOX_SOYADI_INDEX]),
    line[WOLVOX_GIRIS_INDEX],
    line[WOLVOX_CIKIS_INDEX]);
  console.log("wolvox to data", result);
  return result;
};

const kimbilCsvToData = (line) => {
  const result = toData(
    kimbilStringConvert(line[KIMBIL_ODA_NO_INDEX] + ""),
    kimbilStringConvert(line[KIMBIL_ADI_INDEX]),
    kimbilStringConvert(line[KIMBIL_SOYADI_INDEX]),
    line[KIMBIL_GIRIS_INDEX], "-");
  console.log("kimbil to data", result);
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

const contains = (container, contained) => {
  return container.indexOf(contained) >= 0;
};

const commonStringConvert = (s) => {
  s = replaceAll(s, " ", "");
  s = replaceAll(s, "�", "_");
  s = replaceAll(s, "\r", "");
  return s;
};

const wolvoxStringConvert = (s) => {
  s = replaceAll(s, "Ý", "&#304;");
  s = replaceAll(s, "Þ", "&#350;");
  s = replaceAll(s, "Ð", "&#286;");
  s = commonStringConvert(s);
  return s;
};

const kimbilStringConvert = (s) => {
  s = replaceAll(s, "˜", "&#304;");
  s = replaceAll(s, "ž", "&#350;");
  s = replaceAll(s, "¦", "&#286;");
  s = replaceAll(s, "š", "&Uuml;");
  s = replaceAll(s, "™", '&Ouml;');
  s = replaceAll(s, "€", '&Ccedil;');
  s = commonStringConvert(s);
  return s;
};

const stringConvertFunctions = {};
stringConvertFunctions[KEY_CSV_KIMBIL] = kimbilStringConvert;
stringConvertFunctions[KEY_CSV_WOLVOX] = wolvoxStringConvert;

const convertOneCsvData = (that, key) => {
  const raw = that.rawData[key];
  if (raw) {
    that.fullData[key] = [];
    const data = extractCsv(raw);
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
      that.fullData[key].push(compiled);
    }
    console.log(key, "full", that.fullData[key]);
    that.fullData[key].sort((a, b) => {
      // soyadi, adi
      if (a.soyadi === b.soyadi) {
        return a.adi > b.adi;
      }
      return a.soyadi > b.soyadi;
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
  const adi = resemble(baseEntry.adi, otherEntry.adi);
  const soyadi = resemble(baseEntry.soyadi, otherEntry.soyadi);
  if (oda && adi && soyadi) {
    console.log("Found match:", baseEntry, otherEntry);
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
    document.getElementById(EXISTS_HERE_BUT_NOT_OTHER_PREFIX + key).textContent = `${key} checked!`;
    console.log("not in other ", key, notInOther.length, "of", baseData.length);

    const holder = document.getElementById(DATA_HOLDER_DIV_PREFIX + key);
    let trs = "";
    for (let entry of that.fullData[key]) {
      trs += `<tr${entry.notInOther ? " style=\"background-color:red;\"" : ""}><td>${entry.odaNo}</td><td>${entry.adi}</td><td>${entry.soyadi}</td></tr>`;
    }
    const table = `<table><tbody>${trs}</tbody></table>`;
    console.log("Holder", holder);
    console.log("Table", table);
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
      console.log("in2", file);
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function (evt) {
        console.log("Read", evt.target.result);
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

  existsHereButNotOther(key) {
    return <div id={`${EXISTS_HERE_BUT_NOT_OTHER_PREFIX}${key}`}></div>;
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
        <table className="full">
          <tbody>
            <tr>
              <td>{this.fileReader(KEY_CSV_WOLVOX)}</td>
              <td>{this.fileReader(KEY_CSV_KIMBIL)}</td>
            </tr>
            <tr>
              <td>{this.existsHereButNotOther(KEY_CSV_WOLVOX)}</td>
              <td>{this.existsHereButNotOther(KEY_CSV_KIMBIL)}</td>
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
