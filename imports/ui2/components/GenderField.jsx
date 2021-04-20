import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import Select from "react-select";

const messages = defineMessages({
  placeholder: {
    id: "app.gender_field.placeholder",
    defaultMessage: "Select a gender...",
  },
});

export const genderLabels = defineMessages({
  cis_woman: {
    id: "app.people.gender.cis_woman",
    defaultMessage: "Cisgender woman",
  },
  cis_man: {
    id: "app.people.gender.cis_man",
    defaultMessage: "Cisgender man",
  },
  trans_woman: {
    id: "app.people.gender.trans_woman",
    defaultMessage: "Trans woman",
  },
  trans_man: {
    id: "app.people.gender.trans_man",
    defaultMessage: "Trans man",
  },
  transvestite: {
    id: "app.people.gender.transvestite",
    defaultMessage: "Transvestite",
  },
  non_binary: {
    id: "app.people.gender.non_binary",
    defaultMessage: "Non binary",
  },
  other: {
    id: "app.people.gender.other",
    defaultMessage: "Other",
  },
  unknown: {
    id: "app.people.gender.unknown",
    defaultMessage: "I'd rather not declare",
  },
});

class GenderField extends Component {
  options = [
    "trans_woman",
    "transvestite",
    "cis_woman",
    "trans_man",
    "cis_man",
    "non_binary",
    "other",
    "unknown",
  ];
  _getOptions = () => {
    const { intl } = this.props;
    let options = [];
    for (const option of this.options) {
      options.push({
        value: option,
        label: genderLabels[option]
          ? intl.formatMessage(genderLabels[option])
          : option,
      });
    }
    return options;
  };
  _getValue = () => {
    const { value } = this.props;
    return this._getOptions().find((option) => option.value == value);
  };
  _handleChange = (selected) => {
    const { name, onChange } = this.props;
    onChange && onChange({ target: { name, value: selected.value } });
  };
  render() {
    const { intl, name } = this.props;
    return (
      <Select
        classNamePrefix="select"
        placeholder={intl.formatMessage(messages.placeholder)}
        isSearchable={false}
        value={this._getValue()}
        onChange={this._handleChange}
        options={this._getOptions()}
      />
    );
  }
}

GenderField.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GenderField);
