import fs from 'fs';

const orderObjectKeysRecursive = (obj) => {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(e => orderObjectKeysRecursive(e));
    } else {
      return Object.keys(obj).sort().reduce(
        (obj2, key) => { 
          obj2[key] = orderObjectKeysRecursive(obj[key]); 
          return obj2;
        }, 
        {}
      );
    }    
  }
  return obj;
}

const saferStringify = (obj) => {
  try {
    return JSON.stringify(orderObjectKeysRecursive(obj), null, 2);
  } catch (err) {
    // do nothing
  }
  return obj;
}

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
  const expStr = saferStringify(expected);
  const recStr = saferStringify(received);
  if (expStr !== recStr) {
      const date = Date.now();
      fs.writeFileSync(`test_${date}_expected.json`, expStr);
      fs.writeFileSync(`test_${date}_received.json`, recStr);
      throw Error(`
      Values do not equal:
        Expected:
          ${expStr}
        Received:
          ${recStr}`);
  }
};
