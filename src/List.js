import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const DATA_HOLDER_DIV_PREFIX = "data-holder-";

const ERROR_CODES = {
    DLE: {
        key: 'DLE',
        label: 'Diğer listede eksik'
    },
    BK: {
        key: 'BK',
        label: 'Boş karavan'
    },
    BKB: {
        key: 'BKB',
        label: 'Benzer kayıt bulundu'
    },
    AOAIFS: {
        key: 'AOAIFS',
        label: 'Aynı oda aynı isim farklı soyisim bulundu'
    },
    AIFO: {
        key: 'AIFO',
        label: 'Aynı isim farklı oda bulundu'
    },
    WTE: {
        key: 'WTE',
        label: 'Wolvox\'ta TC eksik'
    }
};

class List extends Component {

    static propTypes = {
        sourceKey: PropTypes.string.isRequired,
        dataForKey: PropTypes.array,
        printView: PropTypes.bool.isRequired,
    };
    shouldShowLine (entry) {
        if (!this.props.printView) {
            return true;
        } else {
            return entry.notInOther;
        }
    }
    styleNotInOther(st) {
        if (this.props.printView) {
            return {... st, color: 'red'}
        } else {
            return {... st, backgroundColor: 'red'}
        }
    }
    styleEmptyCaravan(st) {
        if (this.props.printView) {
            return {... st, 'font-style': 'italic'}
        } else {
            return {... st, backgroundColor: 'lightgreen'}
        }
    }
    styleSimilarFound(st) {
        if (this.props.printView) {
            return {... st, color: 'orange'}
        } else {
            return {... st, backgroundColor: 'yellow'}
        }
    }
    styleSameRoomNoAndFirstNameFound(st) {
        if (this.props.printView) {
            return {... st, color: 'fuchsia'}
        } else {
            return {... st, backgroundColor: 'fuchsia'}
        }
    }
    styleSameNameButDifferentRoomNoFound(st) {
        if (this.props.printView) {
            return {... st, 'font-weight': 'bold'}
        } else {
            return {... st, backgroundColor: 'lightblue'}
        }
    }
    styleWolvoxMissingTcNo(st) {
        if (this.props.printView) {
            return {... st, color: 'darkblue'}
        } else {
            return {... st, border: '1px solid turquoise'}
        }
    }
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
                let errorCodes = [];
                if (entry.notInOther) {
                    st = this.styleNotInOther(st);
                    errorCodes.push(ERROR_CODES.DLE.key);
                    if (entry.isEmptyCaravan) {
                        st = this.styleEmptyCaravan(st);
                        errorCodes.push(ERROR_CODES.BK.key);
                    }
                    if (entry.similarFound === true) {
                        st = this.styleSimilarFound(st);
                        errorCodes.push(ERROR_CODES.BKB.key);
                    } else {
                        if (entry.sameRoomNoAndFirstNameFound) {
                            st = this.styleSameRoomNoAndFirstNameFound(st);
                            errorCodes.push(ERROR_CODES.AOAIFS.key);
                        }
                        if (entry.sameNameButDifferentRoomNoFound) {
                            st = this.styleSameNameButDifferentRoomNoFound(st);
                            errorCodes.push(ERROR_CODES.AIFO.key);
                        }
                    }
                    if (entry.wolvoxMissingTcNo) {
                        st = this.styleWolvoxMissingTcNo(st);
                        errorCodes.push(ERROR_CODES.WTE.key);
                    }
                }
                if(this.shouldShowLine(entry)) {
                    const ectd = this.props.printView ? <td>{errorCodes.join(' ')}</td> : '';
                    trs.push(<tr key={key} style={st}>{ectd}<td>{entry.odaNo}</td><td>{entry.adi}</td><td>{entry.soyadi}</td><td>{entry.identityNo}</td><td>{entry.giris}</td></tr>);
                }
            }
        }
        const ecth = this.props.printView ? <th>Hata kodu</th> : '';
        const errorCodes = this.props.printView ? <p>{Object.values(ERROR_CODES).map(ec => `${ec.key}: ${ec.label}`).join(', ')}</p> : '';
        return <div className="holder" id={`${DATA_HOLDER_DIV_PREFIX}${this.props.sourceKey}`}>
            {text}
            {errorCodes}
            <table>
                <thead><tr>{ecth}<th>Oda No</th><th>Ad&#305;</th><th>Soyad&#305;</th><th>TC / Pasaport No</th><th>Giri&#351; tarihi</th></tr></thead>
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