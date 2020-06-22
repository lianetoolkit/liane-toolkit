import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import { CountryRegionData } from "react-country-region-selector";
import Select from "react-select";

const messages = defineMessages({
  placeholder: {
    id: "app.country_select.placeholder",
    defaultMessage: "Select a country...",
  },
});

class CountrySelect extends Component {
  _handleChange = (selected) => {
    const { name, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({ target: { name, value: selected ? selected.value : null } });
    }
  };
  _getOptions = () => {
    return CountryRegionData.map((c) => {
      return {
        value: c[1],
        label: c[0],
      };
    });
  };
  _getValue = () => {
    const { value } = this.props;
    return this._getOptions().find((option) => option.value == value);
  };
  render() {
    const { intl, name, clearable } = this.props;
    return (
      <Select
        classNamePrefix="select-search"
        cacheOptions
        isClearable={clearable}
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

CountrySelect.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CountrySelect);
