import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import { uniq, sortBy } from "lodash";

import SkillsConfig, { defaultSkillsLabels } from "./SkillsConfig.jsx";
import CreatableSelect from "react-select/creatable";
import Form from "./Form.jsx";

const messages = defineMessages({
  placeholder: {
    id: "app.skills.placeholder",
    defaultMessage: "Skills...",
  },
});

const Container = styled.div`

`;

class SkillsField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [...this.getOptions()],
      value: [],
    };
  }
  getOptions = () => {
    const { intl, options } = this.props;
    let configOptions = [];
    for (const option of options || SkillsConfig.defaultOptions) {
      if (typeof option == "string") {
        configOptions.push({
          label: defaultSkillsLabels[option]
            ? intl.formatMessage(defaultSkillsLabels[option])
            : option,
          value: option,
        });
      } else if (option.active) {
        configOptions.push({ label: option.label, value: option.value });
      }
    }
    return sortBy(configOptions, (opt) => opt.label);
  };
  componentDidMount() {
    const { value } = this.props;
    if (value && value.length) {
      this.setState({ value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { name, onChange } = this.props;
    const { value } = this.state;
    if (JSON.stringify(value) != JSON.stringify(prevState.value) && onChange) {
      onChange({ target: { name, value } });
    }
  }
  _handleChange = ({ target }) => {
    const { value } = this.state;
    if (target.checked && value.indexOf(target.value) == -1) {
      this.setState({
        value: [...value, target.value],
      });
    } else if (!target.checked && value.indexOf(target.value) !== -1) {
      this.setState({
        value: value.filter((val) => val !== target.value),
      });
    }
  };
  _buildValue = () => {
    const { value } = this.state;
    let builtValue = [];
    const defaultOptions = this.getOptions();
    if (value && value.length) {
      for (let val of value) {
        const fromDefault = defaultOptions.find(
          (option) => option.value == val
        );
        builtValue.push({
          value: val,
          label: fromDefault ? fromDefault.label : val,
        });
      }
    }
    return builtValue;
  };
  _isChecked = (value) => {
    return (
      this.state.value &&
      this.state.value.length &&
      this.state.value.indexOf(value) !== -1
    );
  };
  render() {
    const { intl, name } = this.props;
    const { options } = this.state;
    return (
      <Form.CheckboxGroup>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="checkbox"
              value={option.value}
              checked={this._isChecked(option.value)}
              onChange={this._handleChange}
            />
            {option.label}
          </label>
        ))}
      </Form.CheckboxGroup>
    );
    return (
      <CreatableSelect
        classNamePrefix="select-search"
        cacheOptions
        isMulti
        placeholder={intl.formatMessage(messages.placeholder)}
        options={options}
        onCreateOption={this._handleCreateOption}
        onChange={this._handleChange}
        name={name}
        value={this._buildValue()}
      />
    );
  }
}

SkillsField.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SkillsField);
