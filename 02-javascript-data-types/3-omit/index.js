/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const newObj = {};
  for (let key in obj) {
    const shouldOmit = fields.includes(key);
    if (!shouldOmit) newObj[key] = obj[key]; // TODO: add deep copy if needed
  }
  return newObj;
};

export const omit2 = (obj, ...fields) => {
  const newObj = { ...obj };
  fields.forEach((f) => delete newObj[f]);
  return newObj;
};
