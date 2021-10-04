import { CLIEngine } from "eslint";

/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const propsArr = path.split(".");
  let counter = 0;
  // return recursivePropSearch(propsArr);

  return function recursiveSearch(obj) {
    if (typeof obj !== "object") return obj;
    const currentProp = propsArr[counter];
    const noMoreProps = counter === propsArr.length - 1;
    if (noMoreProps) {
      counter = 0;
      return obj[currentProp];
    }

    counter += 1;
    return recursiveSearch(obj[currentProp]);
  };
}

// Another posible solution #2:

export function createGetter2(path) {
  const propsArr = path.split(".");
  let propsArrClone = [...propsArr];

  return function recursiveSearch2(obj) {
    if (typeof obj !== "object") return obj;

    const [currentProp, ...restProps] = propsArrClone;

    if (restProps.length === 0) {
      propsArrClone = [...propsArr]; // restoring closured variable array state
      return obj[currentProp];
    }

    propsArrClone = restProps; // mutate closured variable array state
    return recursiveSearch2(obj[currentProp]);
  };
}

// Another posible solution #3:

export function createGetter3(path) {
  const propsArr = path.split(".");
  let propsArrClone = [...propsArr];

  return function recursiveSearch3(obj) {
    if (typeof obj !== "object") return obj;

    const currentProp = propsArrClone.shift();
    const noMoreProps = propsArrClone.length === 0;

    if (noMoreProps) {
      propsArrClone = [...propsArr]; // restoring closured variable array state
      return obj[currentProp];
    }

    return recursiveSearch3(obj[currentProp]);
  };
}

// Another posible solution #4:

export function createGetter4(path) {
  const propsArr = path.split(".");

  return function iterationSearch(obj) {
    let nextResult = obj[propsArr[0]];
    if (!nextResult) return;

    for (const prop of propsArr.slice(1)) {
      if (nextResult[prop]) nextResult = nextResult[prop];
      else return;
    }
    return nextResult;
  };
}
