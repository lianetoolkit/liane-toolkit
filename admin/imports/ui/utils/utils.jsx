import React from "react";
import { getRoleColor } from "/imports/utils/common.js";
import { Icon, Label } from "semantic-ui-react";

export const booleanToIcon = value => {
  if (value) {
    return <Icon name="checkmark" color="green" />;
  } else {
    return <Icon name="remove" color="red" />;
  }
  return;
};

export const getLabelForRole = role => {
  const roleColor = getRoleColor(role);
  // console.log({ role, roleColor });
  return <Label color={roleColor}>{role}</Label>;
};

export const lightenDarkenColor = (col, amt) => {
  var usePound = false;

  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
};
