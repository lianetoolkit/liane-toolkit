import React, { Component } from "react";
import Select from "react-select";
import { languages } from "/locales";

export default class LanguageSelect extends Component {
  _getOptions = (value = false) => {
    const { allowAny } = this.props;
    const options = [];
    if (allowAny) {
      options.push({
        value: "",
        label: "All languages",
      });
    }
    for (const language in languages) {
      options.push({
        value: language,
        label: languages[language],
      });
    }
    if (value !== false) {
      return options.find((option) => option.value == value);
    }
    return options;
  };
  _handleChange = (selected) => {
    this.props.onChange &&
      this.props.onChange({
        target: {
          name: this.props.name || "language",
          value: selected ? selected.value : null,
        },
      });
  };
  render() {
    const { value, placeholder } = this.props;
    return (
      <Select
        classNamePrefix="select-search"
        placeholder={placeholder || "Select a language..."}
        options={this._getOptions()}
        onChange={this._handleChange}
        value={value ? this._getOptions(value) : null}
      />
    );
  }
}
