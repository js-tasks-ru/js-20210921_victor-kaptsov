/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) return "";
  if (!size) return string;

  const symbols = string.split("");
  let currentCount = 0;
  let prevSymbol = "";
  let filteredStr = "";

  for (const s of symbols) {
    const symbolRepeat = s === prevSymbol;
    if (symbolRepeat) currentCount++;
    else currentCount = 1;
    if (currentCount <= size) filteredStr += s;
    prevSymbol = s;
  }
  return filteredStr;
}
