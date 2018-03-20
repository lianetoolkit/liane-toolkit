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

export const getRatio = function(audience) {
  if (!audience) return "";
  audience = transformValues(audience);
  if (audience.total <= 1500) {
    return "--";
  }
  let prefix, ratio;
  const local = audience.estimate / audience.total;
  const location = audience.location_estimate / audience.location_total;
  if (local > location) {
    prefix = "+";
    ratio = local / location;
  } else {
    prefix = "-";
    ratio = location / local;
  }
  if (isFinite(ratio)) {
    return prefix + ratio.toFixed(2) + "x";
  } else {
    return "--";
  }
};

export const getPercentage = function(audience) {
  if (!audience) return "";
  audience = transformValues(audience);
  if (audience.total <= 1500) {
    return "";
  }
  let dif = Math.min(audience.estimate / audience.total, 0.99);
  return (dif * 100).toFixed(2) + "%";
};

export default {
  getValue,
  transformValues,
  getRatio,
  getPercentage
};
