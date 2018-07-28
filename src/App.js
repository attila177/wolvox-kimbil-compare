import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const KEY_CSV_WOLVOX = "csv-wolvox";
const KEY_CSV_KIMBIL = "csv-kimbil";

const WOLVOX_ODA_NO_INDEX = 0;
const WOLVOX_ADI_INDEX = 4;
const WOLVOX_SOYADI_INDEX = 5;
const WOLVOX_GIRIS_INDEX = 8;
const WOLVOX_CIKIS_INDEX = 9;

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

const wolvoxToData = (line) => {
  if (line.length < 2) {
    return;
  }
  const result = toData(line[WOLVOX_ODA_NO_INDEX], line[WOLVOX_ADI_INDEX], line[WOLVOX_SOYADI_INDEX], line[WOLVOX_GIRIS_INDEX], line[WOLVOX_CIKIS_INDEX]);
  console.log("wolvox to data", result);
  return result;
};

const kimbilToData = (line) => {
  const result = toData(line[KIMBIL_ODA_NO_INDEX], line[KIMBIL_ADI_INDEX], line[KIMBIL_SOYADI_INDEX], line[KIMBIL_GIRIS_INDEX], "-");
  console.log("kimbil to data", result);
  return result;
};

const toDataFunctions = {};
toDataFunctions[KEY_CSV_KIMBIL] = kimbilToData;
toDataFunctions[KEY_CSV_WOLVOX] = wolvoxToData;

const handleData = (that, key) => {
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
      const compiled = toDataFunctions[key](entry);
      that.fullData[key].push(compiled);
    }
    console.log(key, "full", that.fullData[key]);
    that.fullData[key].sort((a, b) => {
      // oda no, soyadi, adi
      if (a.odaNo === b.odaNo) {
        if (a.soyadi === b.soyadi) {
          return a.adi > b.adi;
        }
        return a.soyadi > b.soyadi;
      }
      return a.odaNo > b.odaNo;
    });
    console.log(key, "full sorted", that.fullData[key]);
  }
};

const convertCsvData = (that) => {
  handleData(that, KEY_CSV_KIMBIL);
  handleData(that, KEY_CSV_WOLVOX);
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
        convertCsvData(that);
      }
      reader.onerror = function (evt) {
        console.log("error", evt);
      }
    };
    const dataIsPresent = <div id={`{id}-present`} ></div >;
    return <div>{id}: <br /><input type="file" id={id} onChange={read} /> {dataIsPresent}</div>;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Wolvox Kimbil Compare</h1>
        </header>
        <table>
          <tr>
            <td>{this.fileReader(KEY_CSV_WOLVOX)}</td>
            <td>{this.fileReader(KEY_CSV_KIMBIL)}</td>
          </tr>
        </table>
      </div>
    );
  }
}

export default App;
