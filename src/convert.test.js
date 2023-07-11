import { DataConverter } from './convert';
import {KEY_CSV_KIMBIL, KEY_CSV_WOLVOX} from './common';
import fs from 'fs';
import {consoleMock} from './commontest';

describe('convert', () => {

    const voidFn = () => {};
    const that = {
        props: {
            dispatch: voidFn,
        },
    };

    it('converts problematic wolvox', () => {
        const inputcsv = fs.readFileSync('./test/wolvox_problematic.csv').toString();

        const dataConverter = new DataConverter(voidFn, voidFn, KEY_CSV_WOLVOX, inputcsv, consoleMock);
        const result = dataConverter.convertOneCsvData(that);

        expect(result.length).toEqual(2);
        expect(result).toEqual([
            {
              odaNo: '00003',
              adi: 'I2',
              soyadi: 'SI2',
              giris: '30.07.2021',
              cikis: '2.08.2021',
              adi_simple: 'I2',
              soyadi_simple: 'SI2',
              isValid: true,
              gecerliBelge: '',
              kimlikNo: '',
              uyruk: '',
            },
            {
              odaNo: '00004',
              adi: 'I1',
              soyadi: 'SI1',
              giris: '30.07.2021',
              cikis: '1.08.2021',
              adi_simple: 'I1',
              soyadi_simple: 'SI1',
              isValid: true,
              gecerliBelge: '',
              kimlikNo: '11234567890',
              uyruk: 'TC',
            },
          ]);
    });

    it('converts 2023 kimbil data', () => {
        const inputKimbilCsv = fs.readFileSync('./test/2023_kimbil.csv').toString();

        const dataConverter = new DataConverter(voidFn, voidFn, KEY_CSV_KIMBIL, inputKimbilCsv, consoleMock);
        const resultKimbil = dataConverter.convertOneCsvData(that);

        expect(resultKimbil.length).toEqual(2);
        expect(resultKimbil).toEqual([
            {
              odaNo: '018',
              adi: 'KS*****',
              soyadi: 'UF*****',
              giris: '10.07.2023 15:08',
              cikis: '-',
              adi_simple: 'KS*****',
              soyadi_simple: 'UF*****',
              isValid: true,
              gecerliBelge: 'C1******78T',
              kimlikNo: '',
              uyruk: 'UNITEDSTATES',
            },
            {
              odaNo: '218',
              adi: 'UR*****',
              soyadi: 'F�*****',
              giris: '10.07.2023 15:43',
              cikis: '-',
              adi_simple: 'UR*****',
              soyadi_simple: 'FU*****',
              isValid: true,
              gecerliBelge: '',
              kimlikNo: '12******901',
              uyruk: 'T�RK�YE',
            },
          ]);
    });

    it('converts 2023 wolvox data', () => {
        const inputWolvoxCsv = fs.readFileSync('./test/2023_wolvox.csv').toString();

        const dataConverter = new DataConverter(voidFn, voidFn, KEY_CSV_WOLVOX, inputWolvoxCsv, consoleMock);
        const resultWolvox = dataConverter.convertOneCsvData(that);

        expect(resultWolvox.length).toEqual(2);
        expect(resultWolvox).toEqual([{
            'adi': 'KSAVIER',
            'adi_simple': 'KSAVIER',
            'cikis': '17.07.2023',
            'gecerliBelge': '',
            'giris': '3.07.2023',
            'isValid': true,
            'kimlikNo': 'C123456678T',
            'odaNo': '00018',
            'soyadi': 'UFMANOV',
            'soyadi_simple': 'UFMANOV',
            'uyruk': 'DEU',
          },
          {
            'adi': 'URUG',
            'adi_simple': 'URUG',
            'cikis': '1.08.2023',
            'gecerliBelge': '',
            'giris': '25.06.2023',
            'isValid': true,
            'kimlikNo': '12345678901',
            'odaNo': '00218',
            'soyadi': 'FUSUN',
            'soyadi_simple': 'FUSUN',
            'uyruk': 'TC',
          },
        ]);
    });
});
