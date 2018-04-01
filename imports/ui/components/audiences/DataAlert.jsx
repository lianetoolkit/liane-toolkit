import React from "react";
import { Icon, Popup } from "semantic-ui-react";
import AudienceUtils from "./Utils.js";

export default class DataAlert extends React.Component {
  render() {
    const { audience } = this.props;
    const transformed = AudienceUtils.transformValues(audience);
    let icon = "checkmark";
    let color = "green";
    let message = "Sample is big enough for analysis";
    if (!transformed.estimate) {
      icon = "warning sign";
      color = "red";
      message = "Data does not exist";
    }
    if (transformed.estimate < 2000) {
      icon = "warning sign";
      color = "yellow";
      message = "Data is relatively small, not enough for accurate analysis.";
    }
    if (transformed.estimate < 1100) {
      color = "red";
      message = "Sample is too small, data not trustworthy";
    }
    return (
      <Popup trigger={<Icon name={icon} color={color} />} content={message} />
    );
  }
}
