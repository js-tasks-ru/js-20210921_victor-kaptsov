/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  // Guard expression #1
  if (!Array.isArray(arr)) {
    throw new Error(
      "First param should be an Array, but got `",
      typeof arr,
      "` instead"
    );
  }

  // Inner state
  const arrClone = arr.slice();
  const availableSortDirections = ["asc", "desc"];

  // Guard expression #2
  if (!availableSortDirections.includes(param)) {
    // throw new Error('Unknown sorting param:', param)
    console.error("Unknown sort direction:", param);
    param = "asc";
  }

  // Logic
  return arrClone.sort(reasonableStringSort(param));
}

/**
 * reasonableStringSort — reasonable sorting of EN and RU strings with rules:
 *  - Uppercase goes first
 *  - Supports Diacritic symbols
 * @param {string} — string of `direction` type: 'asc' | 'desc'
 * @returns {function} - callback function for Array.sort() consumption
 */
function reasonableStringSort(direction) {
  const directionMultiplier = direction === "desc" ? -1 : 1;

  /**
   * anonymous — make proper sorting of strings
   * @param {string} a
   * @param {string} b
   * @returns {number} - can be -1, 0 or 1
   */
  return (a, b) => {
    if (localeCompareSupportsLocales()) {
      return (
        // FIXME: not sure about `-u-kf` parts usefulness
        a.localeCompare(b, ["ru-RU-u-kf", "en-US-u-kf"], {
          // FIXME: not sure about `sensitivity` option usefulness
          sensitivity: "variant",
          caseFirst: "upper",
        }) * directionMultiplier
      );
    }
    return a.localeCompare(b) * directionMultiplier;
  };
}

/**
 * localeCompareSupportsLocales — check for environmental support of
 * localeCompare's `locale` and `option` flags
 * @returns {boolean}
 */
function localeCompareSupportsLocales() {
  try {
    "a".localeCompare("b", "i");
  } catch (e) {
    return e.name === "RangeError";
  }
  return false;
}
