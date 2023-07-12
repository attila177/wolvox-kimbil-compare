
export const KEY_CSV_WOLVOX = "csv-wolvox";
export const KEY_CSV_KIMBIL = "csv-kimbil";

/**
 * @typedef {'csv-wolvox' | 'csv-kimbil'} DataSourceTypeKey
 */

export const DATA_SOURCE_TYPE_LABEL = {
    [KEY_CSV_WOLVOX]: 'Akınsoft Wolvox CSV',
    [KEY_CSV_KIMBIL]: 'Emniyet Kimbil CSV',
}

const output_log = true;
const output_debug_log = false;

/**
 * Outputs all given arguments into console.log, if output_debug is true.
 */
export const logger = output_log ? {
    ...console,
    debug: output_debug_log ? console.log : () => {}
} : {
    debug: () => {},
    log: () => {},
    warn: () => {},
    error: () => {},
  };

export const isNumberlike = (input) => {
    try {
        return Number.isInteger(Number.parseInt(input));
    } catch (err) {
        return false;
    }
};
