export const getRatio = function(audience) {
  if (!audience) return "";
  if (audience.total < 100) {
    return "Not enough data";
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
  return prefix + ratio.toFixed(2) + "x";
};

export const getPercentage = function(audience) {
  if (!audience) return "";
  if (audience.total < 100) {
    return "";
  }
  let dif = Math.min(audience.estimate / audience.total, 0.99);
  return (dif * 100).toFixed(2) + "%";
};

export default {
  getRatio,
  getPercentage
};
