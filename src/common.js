
export const KEY_CSV_WOLVOX = "csv-wolvox";
export const KEY_CSV_KIMBIL = "csv-kimbil";

const output_debug = true;
export const debug = () => {
    if (!output_debug) {
        return;
    }
    let toLog = "";
    for (let arg of arguments) {
        toLog += ((typeof arg === "string") ? arg : JSON.stringify(arg));
    }
    console.log(toLog);
};