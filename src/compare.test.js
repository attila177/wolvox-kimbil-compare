import { levDist } from './compare';
import { assertEquals } from './commontest';

it('Levenshtein distance is 0', () => {
    const entry1 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt" };
    const entry2 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt" };

    const result = levDist(entry1, entry2, 2);

    console.log("result", result);
    assertEquals(0, result);
});

it('Levenshtein distance is 2', () => {
    const entry1 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt" };
    const entry2 = { adi_simple: "asdsaff", soyadi_simple: "fgfghftttt12" };

    const result = levDist(entry1, entry2, 2);

    console.log("result", result);
    assertEquals(2, result);
});