import { Bert } from "meteor/themeteorchef:bert";

Bert.defaults = {
  hideDelay: 3500,
  // Accepts: a number in milliseconds.
  style: "growl-top-right",
  // Accepts: fixed-top, fixed-bottom, growl-top-left,   growl-top-right,
  // growl-bottom-left, growl-bottom-right.
  type: "default"
  // Accepts: default, success, info, warning, danger.
};

const Alerts = {
  error(error) {
    return Bert.alert({
      // title: 'Something went wrong'
      message: `Sorry, we got an error: ${error}`,
      type: "danger"
    });
  },
  success(text) {
    return Bert.alert({
      message: text,
      type: "success"
    });
  },
  danger(text) {
    return Bert.alert({
      message: text,
      type: "danger"
    });
  },
  warning(text) {
    return Bert.alert({
      message: text,
      type: "warning"
    });
  }
};

exports.Alerts = Alerts;
