import React from "react";
import PropTypes from "prop-types";
import {
  Header,
  Form,
  Input,
  Select,
  Radio,
  Checkbox
} from "semantic-ui-react";
import styled from "styled-components";
import SelectGeolocationFacebook from "/imports/ui/components/geolocations/SelectGeolocationFacebook.jsx";

const GroupWrapper = styled.div`
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  .ui.header {
    color: #999;
  }
`;

export default class CanvasForm extends React.Component {
  static propTypes = {
    config: PropTypes.object
  };
  _control(config) {
    switch (config.fieldType) {
      case "text":
        return Input;
      case "select":
        return Select;
      case "facebook_location":
        return SelectGeolocationFacebook;
      default:
        return null;
    }
  }
  _label(config) {
    if (config.fieldType == "group") {
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
    const fieldProps = {
      key: config.key,
      label: this._label(config),
      control: this._control(config)
    };
    if (config.options) {
      fieldProps["options"] = this._options(config);
    }
    return fieldProps;
  }
  _field(config, children) {
    return <Form.Field {...this._props(config)}>{children || null}</Form.Field>;
  }
  _group(config) {
    if (config.fieldType == "group" && config.fields && config.fields.length) {
      return (
        <GroupWrapper>
          <Header size="tiny">{config.label}</Header>
          {config.fields.map(field => this._field(field))}
        </GroupWrapper>
      );
    } else {
      return null;
    }
  }
  render() {
    const { config } = this.props;
    return this._field(config, this._group(config));
  }
}
