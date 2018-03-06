import React from "react";
import PropTypes from "prop-types";
import {
  Header,
  Form,
  Input,
  TextArea,
  Select,
  Radio,
  Checkbox
} from "semantic-ui-react";
import styled from "styled-components";
import SelectGeolocationFacebook from "/imports/ui/components/geolocations/SelectGeolocationFacebook.jsx";
import FacebookInterestsField from "/imports/ui/components/audiences/FacebookInterestsField.jsx";
import RepeaterField from "./RepeaterField.jsx";
import GroupField from "./GroupField.jsx";

export default class CanvasForm extends React.Component {
  static propTypes = {
    config: PropTypes.object
  };
  constructor(props) {
    super(props);
    this._props = this._props.bind(this);
  }
  _control(config) {
    switch (config.fieldType) {
      case "boolean":
        return Checkbox;
      case "text":
        return Input;
      case "textarea":
        return TextArea;
      case "select":
        return Select;
      case "group":
        return GroupField;
      case "repeater":
        return RepeaterField;
      case "facebook_location":
        return SelectGeolocationFacebook;
      case "facebook_interests":
        return FacebookInterestsField;
      default:
        return null;
    }
  }
  _label(config) {
    if (config.fieldType == "group" || config.fieldType == "repeater") {
      return null;
    } else {
      return config.label;
    }
  }
  _options(config) {
    let options = [];
    if (config.options) {
      for (const key in config.options) {
        options.push({
          key,
          value: key,
          text: config.options[key]
        });
      }
    }
    return options;
  }
  _props(config) {
    const { onChange, name, value } = this.props;
    const fieldProps = {
      key: config.key,
      name: name || config.key,
      label: this._label(config),
      control: this._control(config),
      value: value
    };
    if (config.fieldType == "repeater" || config.fieldType == "group") {
      fieldProps["config"] = config;
    }
    if (config.fieldType == "boolean") {
      delete fieldProps["value"];
      fieldProps["checked"] = !!value;
      if (onChange) {
        fieldProps["onChange"] = function() {
          onChange(null, { name: name || config.key, value: !value });
        };
      }
    } else if (onChange) {
      fieldProps["onChange"] = onChange;
    }
    if (config.options) {
      fieldProps["options"] = this._options(config);
    }
    return fieldProps;
  }
  render() {
    const { config } = this.props;
    return <Form.Field {...this._props(config)} />;
  }
}
