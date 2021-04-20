import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import { CountryRegionData } from "react-country-region-selector";
import Select from "react-select";

const messages = defineMessages({
  placeholder: {
    id: "app.region_select.placeholder",
    defaultMessage: "Select a region...",
  },
});

class RegionSelect extends Component {
  _handleChange = (selected) => {
    const { name, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({ target: { name, value: selected.value } });
    }
  };
  _getOptions = () => {
    const { country } = this.props;
    const countryIdx = CountryRegionData.findIndex(
      (c) => c[0] == country || c[1] == country
    );
    let options = [];
    if (countryIdx) {
      const regions = CountryRegionData[countryIdx][2].split("|");
      options = regions.map((region) => {
        const splitted = region.split("~");
        return {
          value: splitted[1],
          label: splitted[0],
        };
      });
    }
    return options;
  };
  _getValue = () => {
    const { value } = this.props;
    return this._getOptions().find((option) => option.value == value);
  };
  render() {
    const { intl, name } = this.props;
    return (
      <Select
        classNamePrefix="select-search"
        cacheOptions
        isSearchable={true}
        placeholder={intl.formatMessage(messages.placeholder)}
        options={this._getOptions()}
        onChange={this._handleChange}
        name={name}
        value={this._getValue()}
      />
    );
  }
}

RegionSelect.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(RegionSelect);
