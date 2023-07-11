import { assertEquals } from './commontest';

const output_debug = true;

const debugCopy = function () {
    if (!output_debug) {
        return;
    }
    let toLog = "";
    for (let arg of arguments) {
        toLog += ((typeof arg === "string") ? arg : JSON.stringify(arg));
    }
    return toLog;
};

it('Arguments work', () => {
    const result = debugCopy("string1", { "object2key": "object2value" }, 3, ["4", 5, null]);

    assertEquals("string1{\"object2key\":\"object2value\"}3[\"4\",5,null]", result);
});