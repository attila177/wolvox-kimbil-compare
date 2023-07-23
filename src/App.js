import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import List from './List';
import { connect } from 'react-redux';
import { compareAllCsvData } from './compare';
import { DATA_SOURCE_TYPE_LABEL, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX, logger } from './common';
import { DataConverter } from './convert';
import PropTypes from 'prop-types';
import { getStatsForAllLists } from './stats';

const VALIDATION_ERROR_HOLDER = "validation-error-holder";

/**
 * Displays a given message into the validation error display
 * @param {string} key The key for the realm of the validation error (e.g. the key for WOLVOX)
 * @param {string} msg The message to display
 */
const printValidationError = (key, msg) => {
  const oldMsg = document.getElementById(VALIDATION_ERROR_HOLDER + key).innerHTML;
  logger.warn("validation error", key, msg);
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

  static propTypes = {
      data: PropTypes.object,
  };

  constructor(props) {
    super();
    this.state = {
      printView: true,
    };
    this.converters = {};
  }

  /**
   * Returns JSX for a file reader for given realm ID (e.g. WOLVOX realm id)
   * @param {import('./common').DataSourceTypeKey} dataSourceTypeKey The realm ID for which the file reader should be generated
   * @returns {object} The JSX for the file reader, triggering conversion and comparison
   */
  fileReader(dataSourceTypeKey) {
    const that = this;
    const read = (inPar1) => {
      const file = inPar1.target.files[0];
      logger.debug("File metadata", file);
      const reader = new FileReader();
      reader.readAsText(file, 'ISO-8859-1');
      reader.onload = function (evt) {
        const result = evt.target.result?.toString();
        logger.log("Read file:", file);
        document.getElementById(`${dataSourceTypeKey}-present`).textContent = "Yüklendi.";
        that.converters[dataSourceTypeKey] = new DataConverter(printValidationError, resetValidationError, dataSourceTypeKey, result);
        compareAllCsvData(that);
      }
      reader.onerror = function (evt) {
        logger.error("error", evt);
      }
    };
    const dataIsPresent = <div id={`${dataSourceTypeKey}-present`} ></div >;
    return <div>{DATA_SOURCE_TYPE_LABEL[dataSourceTypeKey]}: <br /><input type="file" id={dataSourceTypeKey} onChange={read} /> {dataIsPresent} <br />
    </div>;
  }

  render() {
    const onCheckboxChanged = (e) => {
      this.setState({...this.state, printView: e.target.checked});
    };
    const sorunRenkleri = this.state.printView ? '' : <span>
      Sorun renkleri:<br />
        <span style={{ backgroundColor: "red" }}>Bilinmeyen sorun</span> &nbsp;
        <span style={{ backgroundColor: "yellow" }}>&#x0130;sim yanl&#x0131;&#x015f; yaz&#x0131;lm&#x0131;&#x015f;</span> &nbsp;
        <span style={{ backgroundColor: "fuchsia" }}>Oda numaras&#x0131; ve isim ayn&#x0131;, soyisim farkl&#x0131;</span> &nbsp;
        <span style={{ backgroundColor: "lightblue" }}>&#x0130;sim ve soyisim ayn&#x0131;, oda numaras&#x0131; farkl&#x0131;</span> &nbsp;
        <span style={{ border: "3px dashed turquoise" }}>Wolvox'ta TC nosu eksik</span> &nbsp;
        <br />
    </span>
    let stats = <span/>;
    if (this.props.data && this.props.data[KEY_CSV_KIMBIL] && this.props.data[KEY_CSV_WOLVOX]) {
      const fullStats = getStatsForAllLists(this.props.data);
      stats = <span>
        İki liste toplam müşteri sayıları arasında {fullStats.differenceGuestAmount} fark var.<br/>
        "Düz kırmızı" hata oranı %{fullStats.hardErrorQuota}.
      </span>
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Wolvox Kimbil Compare</h1>
        </header>
        {stats}
        {sorunRenkleri}
        <div className="red" id={`${VALIDATION_ERROR_HOLDER}${KEY_CSV_WOLVOX}`}></div>
        <div className="red" id={`${VALIDATION_ERROR_HOLDER}${KEY_CSV_KIMBIL}`}></div>
        <br />
        <input id="printView" type="checkbox" value= {`${this.state.printView}`} defaultChecked={true} onChange={onCheckboxChanged} />
        <label htmlFor="printView">&Ccedil;&#305;kt&#305; modu (sadece hatal&#305; m&uuml;&#351;terileri g&ouml;ster, beyaz arka plan)</label>
        <br />
        <table className="fullWidth">
          <tbody>
            <tr>
              <td>{this.fileReader(KEY_CSV_WOLVOX)}</td>
              <td>{this.fileReader(KEY_CSV_KIMBIL)}</td>
            </tr>
            <tr>
              <td><List sourceKey={KEY_CSV_WOLVOX} printView={this.state.printView} /></td>
              <td><List sourceKey={KEY_CSV_KIMBIL} printView={this.state.printView} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = function (state, props) {
  const result = { data: state.global }
  return result;
};

const mapDispatchToProps = function (dispatch) {
  return { dispatch: dispatch };
};

/**
 * The root react object for this app
 */
export default connect(mapStateToProps, mapDispatchToProps)(App);

/**
 * @typedef {typeof App} MainApp
 */