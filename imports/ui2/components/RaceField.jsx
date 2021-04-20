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
    id: "app.race_field.placeholder",
    defaultMessage: "Select a race...",
  },
});

export const raceLabels = defineMessages({
  white: {
    id: "app.people.race.white",
    defaultMessage: "White",
  },
  black: {
    id: "app.people.race.black",
    defaultMessage: "Black",
  },
  indigenous: {
    id: "app.people.race.indigenous",
    defaultMessage: "Indigenous",
  },
  other: {
    id: "app.people.race.other",
    defaultMessage: "Other",
  },
  unknown: {
    id: "app.people.race.unknown",
    defaultMessage: "I'd rather not declare",
  },
});

class RaceField extends Component {
  options = ["white", "black", "indigenous", "other", "unknown"];
  _getOptions = () => {
    const { intl } = this.props;
    let options = [];
    for (const option of this.options) {
      options.push({
        value: option,
        label: raceLabels[option]
          ? intl.formatMessage(raceLabels[option])
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

RaceField.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(RaceField);
