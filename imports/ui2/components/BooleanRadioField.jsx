import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import Form from "./Form.jsx";

export default class BooleanRadioField extends Component {
  _handleChange = ({ target }) => {
    const { value } = target;
    const { name, onChange } = this.props;
    onChange &&
      onChange({ target: { name, value: value == "yes" ? true : false } });
  };
  render() {
    const { name, value } = this.props;
    return (
      <Form.CheckboxGroup>
        <label>
          <input
            type="radio"
            name={name}
            value="no"
            checked={value == false}
            onChange={this._handleChange}
          />
          <FormattedMessage
            id="app.boolean_field.no_label"
            defaultMessage="No"
          />
        </label>
        <label>
          <input
            type="radio"
            name={name}
            value="yes"
            checked={value == true}
            onChange={this._handleChange}
          />
          <FormattedMessage
            id="app.boolean_field.yes_label"
            defaultMessage="Yes"
          />
        </label>
      </Form.CheckboxGroup>
    );
  }
}
