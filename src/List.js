import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const DATA_HOLDER_DIV_PREFIX = "data-holder-";

class List extends Component {

    static propTypes = {
        sourceKey: PropTypes.string.isRequired,
        dataForKey: PropTypes.array,
        showAll: PropTypes.bool.isRequired,
    };
    render() {
        let trs = [];
        let text = <span />;
        if (this.props.dataForKey) {
            /** @type {import('./common').AnalyzedGuestEntry[]} */
            const entries = this.props.dataForKey;
            text = <span>{`Listenin ${entries.length} kayıdı var!`}</span>;
            let key = 0;
            for (let entry of entries) {
                key++;
                let st = {};
                if (entry.notInOther) {
                    st = { "backgroundColor": "red" };
                    if (entry.similarFound === true) {
                        st = { "backgroundColor": "yellow" };
                    } else {
                        if (entry.sameRoomNoAndFirstNameFound) {
                            st = { "backgroundColor": "fuchsia" };
                        }
                        if (entry.sameNameButDifferentRoomNoFound) {
                            st = { "backgroundColor": "lightblue" };
                        }
                    }
                    if (entry.wolvoxMissingTcNo) {
                        st = {...st, border: '1px solid turquoise'};
                    }
                }
                if(this.props.showAll || entry.notInOther) {
                    trs.push(<tr key={key} style={st}><td>{entry.odaNo}</td><td>{entry.adi}</td><td>{entry.soyadi}</td><td>{entry.identityNo}</td><td>{entry.giris}</td></tr>);
                }
            }
        }
        return <div className="holder" id={`${DATA_HOLDER_DIV_PREFIX}${this.props.sourceKey}`}>
            {text}
            <table>
                <thead><tr><th>Oda No</th><th>Ad&#305;</th><th>Soyad&#305;</th><th>TC / Pasaport No</th><th>Giri&#351; tarihi</th></tr></thead>
                <tbody>{trs}</tbody>
            </table>
        </div>;
    }
}

const mapStateToProps = function (state, props) {
    const result = { dataForKey: state.global[props.sourceKey] }
    return result;
};

const mapDispatchToProps = function (dispatch) {
    return { dispatch: dispatch };
};


export default connect(mapStateToProps, mapDispatchToProps)(List);