import React from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  formatMessage,
  FormattedMessage,
} from "react-intl";
import Select from "react-select";

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

const GenreFilter = (props) => {
 const _getOptions = () => {
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
   const { intl } = props;

    let options_exact = []; // TODO: modify name of this variable
    for (option of options) {
      options_exact.push({
        value: option,
        label: genderLabels[option]
        ? intl.formatMessage(genderLabels[option])
        : option,
      });
    }

    return options_exact;
  };

  _getValue = () => {
    const { value } = props;
    return _getOptions().find((option) => option.value == value);
  };
  _handleChange = (value) => {
    const { onChange, name } = props;
    if (onChange) {
      onChange({ target: { name, value: value ? value.value : null } });
    }
  };

  return (
    <Select
      classNamePrefix="select"
      isSearchable={false}
      isClearable={true}
      name={props.name}
      placeholder={props.placeholder || "Genre"}
      value={_getValue()}
      onChange={_handleChange}
      options={_getOptions()}
    />
  );
};

GenreFilter.propTypes = {
  intl: intlShape.isRequired,
};

export default GenreFilter;
