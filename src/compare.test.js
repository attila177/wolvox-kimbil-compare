import { levDist, compareAllCsvData, compareEntries } from './compare';
import { assertEquals } from './commontest';
import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import { DataConverter } from './convert';
import {consoleMock} from './commontest';
import fs from 'fs';


describe('Levenshtein distance', () => {
    it('Levenshtein distance is 0', () => {
        const entry1 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt" };
        const entry2 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt" };
    
        const result = levDist(entry1, entry2, 2);
    
        assertEquals(0, result);
    });
    
    it('Levenshtein distance is 2', () => {
        const entry1 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt" };
        const entry2 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt12" };
    
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
            [KEY_CSV_KIMBIL]: new DataConverter(voidFn, voidFn, KEY_CSV_KIMBIL, inputKimbilCsv, consoleMock),
            [KEY_CSV_WOLVOX]: new DataConverter(voidFn, voidFn, KEY_CSV_WOLVOX, inputWolvoxCsv, consoleMock),
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
                    'adi_simple': 'KS*****',
                    'cikis': '-',
                    'gecerliBelge': 'C1******78T',
                    'giris': '10.07.2023 15:08',
                    'isValid': true,
                    'kimlikNo': '',
                    'odaNo': '018',
                    'soyadi': 'UF*****',
                    'soyadi_simple': 'UF*****',
                    'uyruk': 'UNITEDSTATES',
                  },
                  {
                    'adi': 'UR*****',
                    'adi_simple': 'UR*****',
                    'cikis': '-',
                    'gecerliBelge': '',
                    'giris': '10.07.2023 15:43',
                    'isValid': true,
                    'kimlikNo': '12******901',
                    'odaNo': '218',
                    // 'similarFound': false,
                    'soyadi': 'F�*****',
                    'soyadi_simple': 'FU*****',
                    'uyruk': 'T�RK�YE',
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
                      'adi_simple': 'KS*****',
                      'cikis': '-',
                      'gecerliBelge': 'C1******78T',
                      'giris': '10.07.2023 15:08',
                      'isValid': true,
                      'kimlikNo': '',
                      'notInOther': false,
                      'odaNo': '018',
                      // 'similarFound': false,
                      'soyadi': 'UF*****',
                      'soyadi_simple': 'UF*****',
                      'uyruk': 'UNITEDSTATES',
                    },
                    {
                      'adi': 'UR*****',
                      'adi_simple': 'UR*****',
                      'cikis': '-',
                      'gecerliBelge': '',
                      'giris': '10.07.2023 15:43',
                      'isValid': true,
                      'kimlikNo': '12******901',
                      'notInOther': false,
                      'odaNo': '218',
                      // 'similarFound': false,
                      'soyadi': 'F�*****',
                      'soyadi_simple': 'FU*****',
                      'uyruk': 'T�RK�YE',
                    },
                  ],
                  'csv-wolvox': [
                    {
                      'adi': 'KSAVIER',
                      'adi_simple': 'KSAVIER',
                      'cikis': '17.07.2023',
                      'gecerliBelge': '',
                      'giris': '3.07.2023',
                      'isValid': true,
                      'kimlikNo': 'C123456678T',
                      'notInOther': false,
                      'odaNo': '00018',
                      // 'similarFound': false,
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
                      'notInOther': false,
                      'odaNo': '00218',
                      // 'similarFound': false,
                      'soyadi': 'FUSUN',
                      'soyadi_simple': 'FUSUN',
                      'uyruk': 'TC',
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
      adi: "RAPPER",
      adi_simple: "RAPPER",
      cikis: "13.07.2023",
      gecerliBelge: "",
      giris: "8.07.2023",
      isValid: true,
      kimlikNo: "12345678901",
      odaNo: "00301",
      soyadi: "KAPLAN",
      soyadi_simple: "KAPLAN",
      uyruk: "TC"
    };
    const otherEntry = {
      adi: "RA*****",
      adi_simple: "RA*****",
      cikis: "-",
      gecerliBelge: "",
      giris: "8.07.2023 21:29",
      isValid: true,
      kimlikNo: "12******901",
      notInOther: true,
      odaNo: "301",
      soyadi: "KA*****",
      soyadi_simple: "KA*****",
      uyruk: "TÜRKİYE"
    };

    const result = compareEntries(baseEntry, otherEntry);

    expect(result).toEqual(true);
});
});
