/**
 * required: whether the field is considered to be required to be present in the CSV file while parsing it
 * @type {{[name: string]: {required: boolean}}}
 */
const FIELDS = {
  'odaNo': {required: true},
  'adi': {required: true},
  'soyadi': {required: true},
  'giris': {required: true},
  'cikis': {required: false},
  'gecerliBelge': {required: true},
  'kimlikNo': {required: true},
  'uyruk': {required: true},
  'not': {required: false},
}

export default FIELDS;
