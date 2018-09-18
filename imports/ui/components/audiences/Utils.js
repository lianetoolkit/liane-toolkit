export const getValue = function(value, users) {
  if (typeof value == "string" || typeof value == "number") {
    return parseInt(value);
  } else if (typeof value == "object") {
    return value[users || "dau"];
  }
  return 0;
};

export const transformValues = function(audience, users) {
  let transformed = Object.assign({}, audience);
  for (const key in transformed) {
    if (
      key == "estimate" ||
      key == "total" ||
      key == "location_estimate" ||
      key == "location_total"
    ) {
      transformed[key] = getValue(transformed[key], users);
    }
  }
  return transformed;
};

export const getAudienceRatio = function(audience) {
  if (!audience) return "";
  audience = transformValues(audience);
  if (audience.estimate <= 1050) {
    return "--";
  }
  const local = audience.estimate / audience.total;
  const location = audience.location_estimate / audience.location_total;
  return getRatio(location, local);
};

export const getRatio = function(compareTo, target) {
  let prefix, ratio;
  if (target > compareTo) {
    prefix = "+";
    ratio = target / compareTo;
  } else {
    prefix = "-";
    ratio = compareTo / target;
  }
  if (isFinite(ratio)) {
    return prefix + ratio.toFixed(2) + "x";
  } else {
    return "--";
  }
};

export const getAudienceRawRatio = function(audience) {
  if (!audience) return -Infinity;
  audience = transformValues(audience);
  if (audience.estimate <= 1050) {
    return -Infinity;
  }
  const local = audience.estimate / audience.total;
  const location = audience.location_estimate / audience.location_total;
  return getRawRatio(location, local);
};

export const getRawRatio = function(compareTo, target) {
  if (target > compareTo) {
    return target / compareTo;
  } else {
    return -(compareTo / target);
  }
};

export const getRawPercentage = function(audience) {
  if (!audience) return "";
  audience = transformValues(audience);
  if (audience.estimate <= 1050) {
    return 0;
  }
  return Math.min(audience.estimate / audience.total, 0.99);
};

export const getPercentage = function(audience) {
  const percentage = getRawPercentage(audience);
  if (percentage) {
    return (percentage * 100).toFixed(2) + "%";
  }
  return "";
};

export default {
  getValue,
  transformValues,
  getAudienceRatio,
  getRatio,
  getAudienceRawRatio,
  getRawRatio,
  getRawPercentage,
  getPercentage
};
