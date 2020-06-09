import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import Select from "react-select";

export const messages = defineMessages({
  placeholder: {
    id: "app.office_field.placeholder",
    defaultMessage: "Select your office",
  },
  presidency: {
    id: "app.office_field.labels.presidency",
    defaultMessage: "Presidency",
  },
  city_hall: {
    id: "app.office_field.labels.city_hall",
    defaultMessage: "City hall",
  },
  senate: {
    id: "app.office_field.labels.senate",
    defaultMessage: "Senate",
  },
  federal_congress: {
    id: "app.office_field.labels.federal_congress",
    defaultMessage: "Federal Congress",
  },
  state_congress: {
    id: "app.office_field.labels.state_congress",
    defaultMessage: "State Congress",
  },
  city_council: {
    id: "app.office_field.labels.city_council",
    defaultMessage: "City Council",
  },
});

class OfficeField extends Component {
  _getOptions = () => {
    const { country, intl } = this.props;
    switch (country) {
      case "BR":
        return [
          {
            value: "presidency",
            label: "Presidência",
          },
          {
            value: "city_hall",
            label: "Prefeitura",
          },
          {
            value: "senate",
            label: "Senado",
          },
          {
            value: "federal_congress",
            label: "Congresso federal",
          },
          {
            value: "state_congress",
            label: "Congresso estadual",
          },
          {
            value: "city_council",
            label: "Vereança",
          },
        ];
        break;
      default:
        return [
          {
            value: "presidency",
            label: intl.formatMessage(messages.presidency),
          },
          {
            value: "city_hall",
            label: intl.formatMessage(messages.city_hall),
          },
          {
            value: "senate",
            label: intl.formatMessage(messages.senate),
          },
          {
            value: "federal_congress",
            label: intl.formatMessage(messages.federal_congress),
          },
          {
            value: "state_congress",
            label: intl.formatMessage(messages.state_congress),
          },
          {
            value: "city_council",
            label: intl.formatMessage(messages.city_council),
          },
        ];
    }
  };
  _handleChange = (selected) => {
    const { name, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({ target: { name, value: selected ? selected.value : null } });
    }
  };
  _getValue = () => {
    const { value } = this.props;
    return this._getOptions().find((option) => option.value == value);
  };
  render() {
    const { intl, name, placeholder, clearable } = this.props;
    return (
      <Select
        classNamePrefix="select-search"
        options={this._getOptions()}
        isClearable={clearable}
        placeholder={placeholder || intl.formatMessage(messages.placeholder)}
        onChange={this._handleChange}
        name={name}
        value={this._getValue()}
      />
    );
  }
}

OfficeField.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OfficeField);
