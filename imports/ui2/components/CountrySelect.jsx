import React, { Component } from "react";
import { CountryRegionData } from "react-country-region-selector";
import Select from "react-select";

export default class CountrySelect extends Component {
  _handleChange = selected => {
    const { name, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({ target: { name, value: selected.value } });
    }
  };
  _getOptions = () => {
    return CountryRegionData.map(c => {
      return {
        value: c[1],
        label: c[0]
      };
    });
  };
  _getValue = () => {
    const { value } = this.props;
    return this._getOptions().find(option => option.value == value);
  };
  render() {
    const { name } = this.props;
    return (
      <Select
        classNamePrefix="select-search"
        cacheOptions
        isSearchable={true}
        placeholder="Países..."
        options={this._getOptions()}
        onChange={this._handleChange}
        name={name}
        value={this._getValue()}
      />
    );
  }
}
