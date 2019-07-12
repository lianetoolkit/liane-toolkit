import React, { Component } from "react";
import { CountryRegionData } from "react-country-region-selector";
import Select from "react-select";

export default class RegionSelect extends Component {
  _handleChange = selected => {
    const { name, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({ target: { name, value: selected.value } });
    }
  };
  _getOptions = () => {
    const { country } = this.props;
    const countryIdx = CountryRegionData.findIndex(
      c => c[0] == country || c[1] == country
    );
    let options = [];
    if (countryIdx) {
      const regions = CountryRegionData[countryIdx][2].split("|");
      options = regions.map(region => {
        const splitted = region.split("~");
        return {
          value: splitted[1],
          label: splitted[0]
        };
      });
    }
    return options;
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
        placeholder="Selecione uma região..."
        options={this._getOptions()}
        onChange={this._handleChange}
        name={name}
        value={this._getValue()}
      />
    );
  }
}
