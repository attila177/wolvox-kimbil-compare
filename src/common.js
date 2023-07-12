
export const KEY_CSV_WOLVOX = "csv-wolvox";
export const KEY_CSV_KIMBIL = "csv-kimbil";

/**
 * @typedef {'csv-wolvox' | 'csv-kimbil'} DataSourceTypeKey
 */

const output_log = true;

/**
 * Outputs all given arguments into console.log, if output_debug is true.
 */
export const logger = output_log ? console : {
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
