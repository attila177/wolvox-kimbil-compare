import { logger } from './common';

const cellSeparators = [";", "\t", ","];

/**
 * @param {string} needle 
 * @param {string} haystack 
 * @return {number} how many times needle appears in haystack
 */
const countOccurences = (needle, haystack) => {
    let copiedHaystack = "" + haystack;
    let count = 0;
    const max = 1000;
    while (copiedHaystack.indexOf(needle) >= 0 && count < max) {
        const index = copiedHaystack.indexOf(needle);
        count++;
        copiedHaystack = copiedHaystack.substring(index + 1);
    }
    if (count === max) {
        throw new Error("PROB");
    }
    return count;
}

/**
 * @param {string[]} lines The lines of the CSV file
 * @param {string} cellSeparator The separator symbol for which to compute the score
 * @return {number} the computed score. the higher, the better
 */
const cellSeparatorScore = (lines, cellSeparator) => {
    if (!cellSeparator) {
        return Number.NEGATIVE_INFINITY;
    }
    const amountMap = {};
    const amountList = [];
    for (let line of lines) {
        const count = countOccurences(cellSeparator, line);
        if (amountMap[count]) {
            amountMap[count]++;
        } else {
            amountMap[count] = 1;
        }
        amountList.push(count);
    }
    const amounts = Object.keys(amountMap);
    let consistencyScore = amounts.length;
    if (amounts.length > 2) {
        consistencyScore = -1 * amounts.length;
    }
    let highestValue = Number.MIN_VALUE;
    let keyWithHighestValue;
    Object.keys(amountMap).forEach((key) => {
        if(amountMap[key] > highestValue) {
            highestValue = amountMap[key];
            keyWithHighestValue = key;
        }
    });
    const prevalenceScore = keyWithHighestValue;
    const score = 10 * consistencyScore + prevalenceScore;
    logger.info("Cell separator", cellSeparator, "scored", score, "with", amounts, amountList);
    return score;
}

/**
 * @param {string[]} lines The lines of the CSV file
 * @return {string} cellSeparator The separator symbol for with the highest score
 */
const detectCellSeparator = (lines) => {
    const cellSeparatorScores = {};
    let highestScore = Number.MIN_VALUE;
    let cellSeparatorWithHighestScore = null;
    for (let cellSeparator of cellSeparators) {
        const score = cellSeparatorScore(lines, cellSeparator);
        cellSeparatorScores[cellSeparator] = score;
        if (score > highestScore) {
            highestScore = score;
            cellSeparatorWithHighestScore = cellSeparator;
        }
    }
    logger.log("Chose cell separator", cellSeparatorWithHighestScore, "after analysis", cellSeparatorScores);
    return cellSeparatorWithHighestScore;
}

/**
 * Extracts raw csv into a [][].
 * @param {string} rawFileContent The raw file contents
 * @returns A two-dimensional array with csv contents. 
 */
export const extractCsv = (rawFileContent) => {
    const lines = rawFileContent.split("\n");
    const result = [];
    const cellSeparator = detectCellSeparator(lines);

    for (let line of lines) {
        const cells = line.split(cellSeparator);
        result.push(cells.map(cell => cell.trim()));
    }
    console.log(`Extracted matrix with ${result.length} lines. First line has ${result[0].length} cells`);
    return result;
};
