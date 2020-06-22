import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import { setWith, get, clone } from "lodash";

import Button from "./Button.jsx";

const messages = defineMessages({
  namePlaceholder: {
    id: "app.extra_fields.name.placeholder",
    defaultMessage: "Name"
  },
  valuePlaceholder: {
    id: "app.extra_fields.value.placeholder",
    defaultMessage: "Value"
  },
  removeTitle: {
    id: "app.extra_fields.remove.title",
    defaultMessage: "Remove field"
  }
});

const Container = styled.div`
  table {
    width: 100%;
    margin: 0 0 0.5rem;
    th {
      text-align: left;
      font-size: 0.8em;
      color: #666;
    }
    thead {
    }
    td {
      input {
        margin: 0;
      }
    }
  }
  .remove {
    text-decoration: none;
    color: #666;
    font-size: 1.2em;
    display: block;
    padding: 0.5rem;
    background: #f0f0f0;
    border-radius: 7px;
    color: #999;
    text-align: center;
    &:hover,
    &:focus {
      background: #ca3333;
      color: #fff;
    }
    &.disabled {
      background: #f7f7f7;
      &:hover,
      &:focus {
        background: #f7f7f7;
        color: #999;
      }
    }
  }
  .button {
    width: auto;
    float: right;
    margin: 0 0 2rem;
    font-size: 0.8em;
  }
`;

class ExtraFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [
        {
          key: "",
          val: ""
        }
      ]
    };
  }
  componentDidMount() {
    const { value } = this.props;
    if (value && value.length) {
      this.setState({ value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange } = this.props;
    const { value } = this.state;
    if (JSON.stringify(prevState.value) != JSON.stringify(value) && onChange) {
      onChange(value);
    }
  }
  _handleChange = ({ target }) => {
    const { value } = this.state;
    const newValue = clone(value);
    const newData = { data: newValue };
    setWith(newData, target.name, target.value, clone);
    this.setState({
      value: newData.data
    });
  };
  _handleRemoveClick = index => ev => {
    ev.preventDefault();
    const { value } = this.state;
    if (value.length == 1) {
      this.setState({
        value: [{ key: "", val: "" }]
      });
    } else {
      const newValue = value.slice(0);
      newValue.splice(index, 1);
      this.setState({
        value: newValue
      });
    }
  };
  _handleAddNewClick = ev => {
    ev.preventDefault();
    const { value } = this.state;
    const newValue = value.slice(0);
    newValue.push({
      key: "",
      val: ""
    });
    this.setState({
      value: newValue
    });
  };
  render() {
    const { intl } = this.props;
    const { value } = this.state;
    return (
      <Container>
        <table>
          <thead>
            <tr>
              <th>
                <FormattedMessage
                  id="app.extra_fields.name.label"
                  defaultMessage="Field name"
                />
              </th>
              <th>
                <FormattedMessage
                  id="app.extra_fields.value.label"
                  defaultMessage="Value"
                />
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {value.map((item, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    placeholder={intl.formatMessage(messages.namePlaceholder)}
                    value={item.key}
                    name={`data[${i}].key`}
                    onChange={this._handleChange}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder={intl.formatMessage(messages.valuePlaceholder)}
                    value={item.val}
                    name={`data[${i}].val`}
                    onChange={this._handleChange}
                  />
                </td>
                <td>
                  <a
                    href="javascript:void(0);"
                    title={intl.formatMessage(messages.removeTitle)}
                    className="remove"
                    onClick={this._handleRemoveClick(i)}
                  >
                    -
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button href="javascript:void(0);" onClick={this._handleAddNewClick}>
          +{" "}
          <FormattedMessage
            id="app.extra_fields.new_field.label"
            defaultMessage="New extra field"
          />
        </Button>
      </Container>
    );
  }
}

ExtraFields.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(ExtraFields);
