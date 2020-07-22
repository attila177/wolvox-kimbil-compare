
/**
 * @param {*} expected 
 * @param {*} received
 * @throws Error if values do not equal
 * @return nothing 
 */
export const assertEquals = (expected, received) => {
    if (typeof expected !== typeof received) {
        throw Error(`Values do not equal:\nExpected has type ${typeof expected}\nReceived has type ${typeof received}`);
    }
    if (expected !== received) {
        throw Error(`Values do not equal:\nExpected: ${expected}\nReceived: ${received}`);
    }
};