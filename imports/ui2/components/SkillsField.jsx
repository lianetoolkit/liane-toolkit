import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import { uniq } from "lodash";

import SkillsConfig, { defaultSkillsLabels } from "./SkillsConfig.jsx";
import CreatableSelect from "react-select/creatable";

const messages = defineMessages({
  placeholder: {
    id: "app.skills.placeholder",
    defaultMessage: "Skills...",
  },
});

class SkillsField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [...this.getOptions()],
      value: [],
    };
  }
  getOptions = () => {
    const { intl } = this.props;
    let options = [];
    for (const option of SkillsConfig.defaultOptions) {
      options.push({
        label: defaultSkillsLabels[option]
          ? intl.formatMessage(defaultSkillsLabels[option])
          : option,
        value: option,
      });
    }
    return options;
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
  _handleCreateOption = (option) => {
    this.setState({
      options: [
        {
          value: option,
          label: option,
        },
        ...this.state.options,
      ],
      value: uniq([...this.state.value, option]),
    });
  };
  _handleChange = (options) => {
    const { name, onChange } = this.props;
    const value = options.map((option) => option.value);
    this.setState({ value });
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
  render() {
    const { intl, name } = this.props;
    const { options } = this.state;
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
