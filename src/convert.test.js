import { DataConverter } from './convert';
import {KEY_CSV_WOLVOX} from './common';
import fs from 'fs';
import { hasUncaughtExceptionCaptureCallback } from 'process';

describe('convert', () => {
    /** @type {DataConverter} */
    let dataConverter;

    beforeEach(() => {
        dataConverter = new DataConverter(() => {}, () => {});
    });

    it('converts problematic wolvox', () => {
        const inputcsv = fs.readFileSync('./test/wolvox_problematic.csv').toString();
        const that = {
            rawData: {
                [KEY_CSV_WOLVOX]: inputcsv,
            },
            props: {
                dispatch: () => {},
            },
        };
        
        const result = dataConverter.convertOneCsvData(that, KEY_CSV_WOLVOX);

        expect(result.length).toEqual(2);
        expect(result[0].adi).toEqual("I2"); // order inverted compared to input due to sorting by room number
        expect(result[1].adi).toEqual("I1");
    });
});
