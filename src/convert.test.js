import { DataConverter } from './convert';
import { KEY_CSV_KIMBIL, KEY_CSV_WOLVOX } from './common';
import fs from 'fs';

describe('convert', () => {

  const voidFn = () => { };
  const that = {
    props: {
      dispatch: voidFn,
    },
  };

  it('converts problematic wolvox', () => {
    const inputcsv = fs.readFileSync('./test/wolvox_problematic.csv').toString();

    const dataConverter = new DataConverter(voidFn, voidFn, KEY_CSV_WOLVOX, inputcsv);
    const result = dataConverter.convertOneCsvData(that);

    expect(result.length).toEqual(2);
    expect(result).toEqual([
      {
        odaNo: '00003',
        adi: 'I2',
        soyadi: 'SI2',
        giris: '30.07.',
        cikis: '2.08.2021',
        adi_simple: 'I2*',
        soyadi_simple: 'SI*',
        isValid: true,
        gecerliBelge: '',
        kimlikNo: '',
        uyruk: '',
        'paddedOdaNo': '00003',
        'sortKey': '00003SI*I2*',
        'kimlikNo_simple': '',
        'not': '',
        'identityNo': '',
        'identityNo_simple': '',
        'isEmptyCaravan': false,
        'isTurkishCitizen': false,
        'gecerliBelge_simple': '',
      },
      {
        odaNo: '00004',
        adi: 'I1',
        soyadi: 'SI1',
        giris: '30.07.',
        cikis: '1.08.2021',
        adi_simple: 'I1*',
        soyadi_simple: 'SI*',
        isValid: true,
        gecerliBelge: '',
        kimlikNo: '11234567890',
        uyruk: 'TC',
        'paddedOdaNo': '00004',
        'sortKey': '00004SI*I1*',
        'kimlikNo_simple': '11*890',
        'not': '',
        'identityNo': '11234567890',
        'identityNo_simple': '11*890',
        'isEmptyCaravan': false,
        'isTurkishCitizen': true,
        'gecerliBelge_simple': '',
      },
    ]);
  });

  it('converts 2023 kimbil data', () => {
    const inputKimbilCsv = fs.readFileSync('./test/2023_kimbil.csv').toString();

    const dataConverter = new DataConverter(voidFn, voidFn, KEY_CSV_KIMBIL, inputKimbilCsv);
    const resultKimbil = dataConverter.convertOneCsvData(that);

    expect(resultKimbil.length).toEqual(2);
    expect(resultKimbil).toEqual([
      {
        odaNo: '018',
        adi: 'KS*****',
        soyadi: 'UF*****',
        giris: '10.07.',
        cikis: '-',
        adi_simple: 'KS*',
        soyadi_simple: 'UF*',
        isValid: true,
        gecerliBelge: 'C1******78T',
        kimlikNo: '',
        uyruk: 'UNITED STATES',
        'kimlikNo_simple': '',
        'not': undefined,
        'odaNo': '18',
        'paddedOdaNo': '018',
        'sortKey': '018UF*KS*',
        'identityNo': 'C1******78T',
        'identityNo_simple': 'C1*78T',
        'isEmptyCaravan': false,
        'isTurkishCitizen': false,
        'gecerliBelge_simple': 'C1*78T',
      },
      {
        odaNo: '218',
        adi: 'UR*****',
        soyadi: 'F�*****',
        giris: '10.07.',
        cikis: '-',
        adi_simple: 'UR*',
        soyadi_simple: 'FU*',
        isValid: true,
        gecerliBelge: '',
        kimlikNo: '12******901',
        uyruk: 'T�RK�YE',
        'gecerliBelge_simple': '',
        'not': undefined,
        'kimlikNo_simple': '12*901',
        'paddedOdaNo': '218',
        'sortKey': '218FU*UR*',
        'identityNo': '',
        'identityNo_simple': '',
        'isEmptyCaravan': false,
        'isTurkishCitizen': false,
      },
    ]);
  });

  it('converts 2023 wolvox data', () => {
    const inputWolvoxCsv = fs.readFileSync('./test/2023_wolvox.csv').toString();

    const dataConverter = new DataConverter(voidFn, voidFn, KEY_CSV_WOLVOX, inputWolvoxCsv);
    const resultWolvox = dataConverter.convertOneCsvData(that);

    expect(resultWolvox.length).toEqual(2);
    expect(resultWolvox).toEqual([{
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
      'uyruk': 'DEU',
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
      'uyruk': 'TC',
    },
    ]);
  });
});
