import humanize from "humanize-plus";

export const validateEmail = (email) => {
  const re =
    /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

export const getRandomLoremPixel = function (lastDigit) {
  const options = [
    "sports",
    "people",
    "animals",
    "nature",
    "abstract",
    "food",
    "fashion",
    "transport",
    "nightlife",
    "technics",
  ];
  return `http://lorempixel.com/400/400/${options[lastDigit]}`;
};

export const roundFloat = (value) =>
  parseFloat((Math.round(value * 100) / 100).toFixed(2));

const compactNumber = (value) => humanize.compactInteger(value, 1);

const pluralize = function (n, thing) {
  // fairly stupid pluralizer
  if (n === 0) {
    return "";
  }
  if (typeof n === "undefined") {
    return "";
  }
  if (n === 1) {
    return `1 ${thing}`;
  } else {
    return n + " " + thing + "s";
  }
};

export const flattenObject = function (data) {
  let result = {};
  function recurse(cur, prop) {
    let l;
    if (typeof cur == "boolean") {
      result[prop] = cur ? "yes" : "no";
    } else if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (cur instanceof Date) {
      result[prop] = cur.toString();
    } else if (Array.isArray(cur)) {
      if (typeof cur[0] == "string") {
        result[prop] = cur.join(", ");
      } else {
        for (let i = 0, l = cur.length; i < l; i++)
          recurse(cur[i], prop + "[" + i + "]");
        if (l == 0) result[prop] = [];
      }
    } else if (
      (prop.indexOf(".region") !== -1 || prop.indexOf(".city") !== -1) &&
      cur.name
    ) {
      result[prop] = cur.name;
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
};
