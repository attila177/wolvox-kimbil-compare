import { levDist, compareAllCsvData, compareEntries } from './compare';
import { assertEquals } from './commontest';
import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { DataConverter } from './convert';
import fs from 'fs';


describe('Levenshtein distance', () => {
    it('Levenshtein distance is 0', () => {
        const entry1 = { adi_simple: 'asdsaff', soyadi_simple: 'fgfghftttt' };
        const entry2 = { adi_simple: 'asdsaff', soyadi_simple: 'fgfghftttt' };
    
        const result = levDist(entry1, entry2, 2);
    
        assertEquals(0, result);
    });
    
    it('Levenshtein distance is 2', () => {
        const entry1 = { adi_simple: 'asdsaff', soyadi_simple: 'fgfghftttt' };
        const entry2 = { adi_simple: 'asdsaff', soyadi_simple: 'fgfghftttt12' };
    
        const result = levDist(entry1, entry2, 2);
    
        assertEquals(2, result);
    });
});



describe('compareAllCsvData', () => {
    let received = [];
    const voidFn = () => {};
    const inputKimbilCsv = fs.readFileSync('./test/2023_kimbil.csv').toString();
    const inputWolvoxCsv = fs.readFileSync('./test/2023_wolvox.csv').toString();
    const that = {
        props: {
            dispatch: (...args) => received.push(args),
        },
        converters: {
            [KEY_CSV_KIMBIL]: new DataConverter(voidFn, voidFn, KEY_CSV_KIMBIL, inputKimbilCsv),
            [KEY_CSV_WOLVOX]: new DataConverter(voidFn, voidFn, KEY_CSV_WOLVOX, inputWolvoxCsv),
        }
    };

    beforeEach(() => {
        received = [];
    });

    it('compareAllCsvData is 0', () => {
        compareAllCsvData(that);
        const expected = [
            [
              {
                'key': 'csv-kimbil',
                'payload': [
                  {
                    'adi': 'KS*****',
                    'adi_simple': 'KS*',
                    'cikis': '-',
                    'gecerliBelge': 'C1******78T',
                    'gecerliBelge_simple': 'C1*78T',
                    'giris': '10.07.',
                    'identityNo': 'C1******78T',
                    'identityNo_simple': 'C1*78T',
                    'isEmptyCaravan': false,
                    'isTurkishCitizen': false,
                    'isValid': true,
                    'kimlikNo': '',
                    'kimlikNo_simple': '',
                    'odaNo': '18',
                    'paddedOdaNo': '018',
                    'sortKey': '018UF*KS*',
                    'soyadi': 'UF*****',
                    'soyadi_simple': 'UF*',
                    'uyruk': 'UNITED STATES'
                  },
                  {
                    'adi': 'UR*****',
                    'adi_simple': 'UR*',
                    'cikis': '-',
                    'gecerliBelge': '',
                    'gecerliBelge_simple': '',
                    'giris': '10.07.',
                    'identityNo': '',
                    'identityNo_simple': '',
                    'isEmptyCaravan': false,
                    'isTurkishCitizen': false,
                    'isValid': true,
                    'kimlikNo': '12******901',
                    'kimlikNo_simple': '12*901',
                    'odaNo': '218',
                    'paddedOdaNo': '218',
                    'sortKey': '218FU*UR*',
                    'soyadi': 'F�*****',
                    'soyadi_simple': 'FU*',
                    'uyruk': 'T�RK�YE'
                  },
                ],
                'type': 'csv-kimbilCHANGER',
              },
            ],
            [
              {
                'key': 'csv-wolvox',
                'payload': [
                  {
                    'adi': 'KSAVIER',
                    'adi_simple': 'KS*',
                    'cikis': '17.07.2023',
                    'gecerliBelge': '',
                    'gecerliBelge_simple': '',
                    'giris': '3.07.',
                    'identityNo': '',
                    'identityNo_simple': '',
                    'isEmptyCaravan': false,
                    'isTurkishCitizen': false,
                    'isValid': true,
                    'kimlikNo': 'C123456678T',
                    'kimlikNo_simple': 'C1*78T',
                    'not': 'DE���MES�N',
                    'odaNo': '18',
                    'paddedOdaNo': '00018',
                    'sortKey': '00018UF*KS*',
                    'soyadi': 'UFMANOV',
                    'soyadi_simple': 'UF*',
                    'uyruk': 'DEU'
                  },
                  {
                    'adi': 'URUG',
                    'adi_simple': 'UR*',
                    'cikis': '1.08.2023',
                    'gecerliBelge': '',
                    'gecerliBelge_simple': '',
                    'giris': '25.06.',
                    'identityNo': '12345678901',
                    'identityNo_simple': '12*901',
                    'isEmptyCaravan': false,
                    'isTurkishCitizen': true,
                    'isValid': true,
                    'kimlikNo': '12345678901',
                    'kimlikNo_simple': '12*901',
                    'not': '�ad�r 9kw / 03,07\'de konaklamad�.',
                    'odaNo': '00218',
                    'paddedOdaNo': '00218',
                    'sortKey': '00218FU*UR*',
                    'soyadi': 'FUSUN',
                    'soyadi_simple': 'FU*',
                    'uyruk': 'TC'
                  },
                ],
                'type': 'csv-wolvoxCHANGER',
              },
            ],
            [
              {
                'payload': {
                  'csv-kimbil': [
                    {
                      'adi': 'KS*****',
                      'adi_simple': 'KS*',
                      'cikis': '-',
                      'gecerliBelge': 'C1******78T',
                      'gecerliBelge_simple': 'C1*78T',
                      'giris': '10.07.',
                      'identityNo': 'C1******78T',
                      'identityNo_simple': 'C1*78T',
                      'isEmptyCaravan': false,
                      'isTurkishCitizen': false,
                      'isValid': true,
                      'kimlikNo': '',
                      'kimlikNo_simple': '',
                      'notInOther': false,
                      'odaNo': '18',
                      'paddedOdaNo': '018',
                      'sortKey': '018UF*KS*',
                      'soyadi': 'UF*****',
                      'soyadi_simple': 'UF*',
                      'uyruk': 'UNITED STATES'
                    },
                    {
                      'adi': 'UR*****',
                      'adi_simple': 'UR*',
                      'cikis': '-',
                      'gecerliBelge': '',
                      'gecerliBelge_simple': '',
                      'giris': '10.07.',
                      'identityNo': '',
                      'identityNo_simple': '',
                      'isEmptyCaravan': false,
                      'isTurkishCitizen': false,
                      'isValid': true,
                      'kimlikNo': '12******901',
                      'kimlikNo_simple': '12*901',
                      'notInOther': false,
                      'odaNo': '218',
                      'paddedOdaNo': '218',
                      'sortKey': '218FU*UR*',
                      'soyadi': 'F�*****',
                      'soyadi_simple': 'FU*',
                      'uyruk': 'T�RK�YE'
                    },
                  ],
                  'csv-wolvox': [
                    {
                      'adi': 'KSAVIER',
                      'adi_simple': 'KS*',
                      'cikis': '17.07.2023',
                      'gecerliBelge': '',
                      'gecerliBelge_simple': '',
                      'giris': '3.07.',
                      'identityNo': '',
                      'identityNo_simple': '',
                      'isEmptyCaravan': false,
                      'isTurkishCitizen': false,
                      'isValid': true,
                      'kimlikNo': 'C123456678T',
                      'kimlikNo_simple': 'C1*78T',
                      'not': 'DE���MES�N',
                      'notInOther': false,
                      'odaNo': '18',
                      'paddedOdaNo': '00018',
                      'sortKey': '00018UF*KS*',
                      'soyadi': 'UFMANOV',
                      'soyadi_simple': 'UF*',
                      'uyruk': 'DEU'
                    },
                    {
                      'adi': 'URUG',
                      'adi_simple': 'UR*',
                      'cikis': '1.08.2023',
                      'gecerliBelge': '',
                      'gecerliBelge_simple': '',
                      'giris': '25.06.',
                      'identityNo': '12345678901',
                      'identityNo_simple': '12*901',
                      'isEmptyCaravan': false,
                      'isTurkishCitizen': true,
                      'isValid': true,
                      'kimlikNo': '12345678901',
                      'kimlikNo_simple': '12*901',
                      'not': '�ad�r 9kw / 03,07\'de konaklamad�.',
                      'notInOther': false,
                      'odaNo': '00218',
                      'paddedOdaNo': '00218',
                      'sortKey': '00218FU*UR*',
                      'soyadi': 'FUSUN',
                      'soyadi_simple': 'FU*',
                      'uyruk': 'TC'
                    },
                  ],
                },
                'type': 'FULLSTATECHANGER',
              },
            ],
          ];
        
        assertEquals(expected, received);
        expect(received).toEqual(expected);
    });
});

describe('compareEntries', () => {
  it('compareEntries is 0', () => {
    const baseEntry = {
      adi: 'RAPPER',
      adi_simple: 'RA*',
      cikis: '13.07.2023',
      gecerliBelge: '',
      giris: '8.07.2023',
      isValid: true,
      kimlikNo: '12345678901',
      odaNo: '00301',
      soyadi: 'KAPLAN',
      soyadi_simple: 'KA*',
      uyruk: 'TC'
    };
    const otherEntry = {
      adi: 'RA*****',
      adi_simple: 'RA*',
      cikis: '-',
      gecerliBelge: '',
      giris: '8.07.2023 21:29',
      isValid: true,
      kimlikNo: '12******901',
      notInOther: true,
      odaNo: '301',
      soyadi: 'KA*****',
      soyadi_simple: 'KA*',
      uyruk: 'TÜRKİYE'
    };

    const result = compareEntries(baseEntry, otherEntry);

    expect(result).toEqual(true);
});
});
