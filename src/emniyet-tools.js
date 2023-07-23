
/** @param {string} input */
export const mimicIdentityNoAnonymization = (input) => {
  if (input && input.length > 5) {
      const anonStars = new Array(input.length - 4).join('*');
      return `${input.substring(0,2)}${anonStars}${input.substring(input.length - 3)}`;
  } else {
      return input;
  }
};


/** @param {string} input */
export const mimicNameAnonymization = (input) => {
    return input.split(' ').map(substr => substr.substring(0, 2)).join('*') + '*';
};

/** @param {string} input */
export const reduceStars = (input) => {
    if (!input) {
        return input;
    }
    return input.replace(/[*]+/g, '*')
};
