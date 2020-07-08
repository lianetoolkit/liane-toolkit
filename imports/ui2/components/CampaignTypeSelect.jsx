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
    id: "app.campaign_type_field.placeholder",
    defaultMessage: "Select campaign type",
  },
  electoral: {
    id: "app.campaign_type_field.labels.electoral",
    defaultMessage: "Electoral Campaign",
  },
  mandate: {
    id: "app.campaign_type_field.labels.mandate",
    defaultMessage: "Campaign in a mandate",
  },
  mobilization: {
    id: "app.campaign_type_field.labels.mobilization",
    defaultMessage: "Mobilization Campaign",
  },
  marketing: {
    id: "app.campaign_type_field.labels.marketing",
    defaultMessage: "Marketing Campaign",
  },
});

class CampaignTypeSelect extends Component {
  _getOptions = () => {
    const { intl } = this.props;
    return [
      {
        value: "electoral",
        label: intl.formatMessage(messages.electoral),
      },
      {
        value: "mandate",
        label: intl.formatMessage(messages.mandate),
      },
      {
        value: "mobilization",
        label: intl.formatMessage(messages.mobilization),
      },
      {
        value: "marketing",
        label: intl.formatMessage(messages.marketing),
      },
    ];
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

CampaignTypeSelect.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignTypeSelect);
