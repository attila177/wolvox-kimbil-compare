import { debug, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { eventMaker } from './reducers/reducer';

export const stringCompare = (a, b) => {
    return ('' + a).localeCompare(b + '');
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

const compareOne = (that, fullData, key, otherKey) => {
    const baseData = fullData[key];
    const otherData = fullData[otherKey];
    let newData = [];

    if (baseData && otherData) {
        const notInOther = [];
        for (let baseEntry of baseData) {
            let found = false;
            let newEntry = { ...baseEntry };
            for (let otherEntry of otherData) {
                if (compareEntries(baseEntry, otherEntry)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                notInOther.push(baseEntry);
                newEntry.notInOther = true;
            } else {
                newEntry.notInOther = false;
            }
            newData.push(newEntry);
        }
        console.log("dispatching after comparison. not in other ", key, notInOther.length, "of", baseData.length);
        that.props.dispatch(eventMaker(key, newData));
    }
};

export const compareAllCsvData = (that, fullData) => {
    compareOne(that, fullData, KEY_CSV_KIMBIL, KEY_CSV_WOLVOX);
    compareOne(that, fullData, KEY_CSV_WOLVOX, KEY_CSV_KIMBIL);
};

const contains = (container, contained) => {
    return container.indexOf(contained) >= 0;
};