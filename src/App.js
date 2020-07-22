import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import List from './List';
import { connect } from 'react-redux';
import { compareAllCsvData } from './compare';
import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { DataConverter } from './convert';

const VALIDATION_ERROR_HOLDER = "validation-error-holder";

/**
 * Displays a given message into the validation error display
 * @param {string} key The key for the realm of the validation error (e.g. the key for WOLVOX)
 * @param {string} msg The message to display
 */
const printValidationError = (key, msg) => {
  const oldMsg = document.getElementById(VALIDATION_ERROR_HOLDER + key).innerHTML;
  console.warn("validation error", key, msg);
  document.getElementById(VALIDATION_ERROR_HOLDER + key).innerHTML = oldMsg + " <br> " + msg;
};

/**
 * Empties the validation error display for given key
 * @param {string} key The key for the realm of the validation error display (e.g. the key for WOLVOX)
 */
const resetValidationError = (key) => {
  document.getElementById(VALIDATION_ERROR_HOLDER + key).innerHTML = "";
};

class App extends Component {

  constructor(props) {
    super();
    this.rawData = {};
    this.converter = new DataConverter(printValidationError, resetValidationError);
  }

  /**
   * Returns JSX for a file reader for given realm ID (e.g. WOLVOX realm id)
   * @param {string} id The realm ID for which the file reader should be generated
   * @returns {object} The JSX for the file reader, writing file contents into
   * this.rawData and triggering conversion and comparison
   */
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
        let fullData = that.converter.convertAllCsvData(that);
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
        <span style={{ backgroundColor: "fuchsia" }}>Entry with same room number and first name found</span> &nbsp;
        <span style={{ backgroundColor: "lightblue" }}>Entry with same name, but different room number found</span>
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

/**
 * The root react object for this app
 */
export default connect(mapStateToProps, mapDispatchToProps)(App);
