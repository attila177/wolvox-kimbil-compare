/**
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
  'uyruk': {required: true}
}

export default FIELDS;
