import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { debug } from './common';

const DATA_HOLDER_DIV_PREFIX = "data-holder-";

class List extends Component {

    static propTypes = {
        sourceKey: PropTypes.string.isRequired,
        dataForKey: PropTypes.array,
    };
    render() {
        /*
        let trs = "";
        for (let entry of that.fullData[key]) {
            trs += `<tr${entry.notInOther ? " style=\"background-color:red;\"" : ""}><td>${entry.odaNo}</td><td>${entry.adi}</td><td>${entry.soyadi}</td></tr>`;
        }
        const table = `<table><tbody>${trs}</tbody></table>`;
        holder.innerHTML = table;
        */
        let trs = [];
        let text = <span />;
        if (this.props.dataForKey) {
            text = <span> {`List has ${this.props.dataForKey.length} entries!`}</span>;
            for (let entry of this.props.dataForKey) {
                const st = entry.notInOther ? { "background-color": "red" } : {};
                trs.push(<tr style={st}><td>{entry.odaNo}</td><td>{entry.adi}</td><td>{entry.soyadi}</td></tr>);
            }
        }
        return <div className="holder" id={`${DATA_HOLDER_DIV_PREFIX}${this.props.key}`}>
            {text}
            <table><tbody>{trs}</tbody></table>
        </div>;
    }
}

const mapStateToProps = function (state, props) {
    const result = { dataForKey: state.global[props.sourceKey] }
    console.log("Well hello!", state, props.sourceKey, result);
    return result;
};

const mapDispatchToProps = function (dispatch) {
    return { dispatch: dispatch };
};


export default connect(mapStateToProps, mapDispatchToProps)(List);