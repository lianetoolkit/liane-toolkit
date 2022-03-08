import React, { useEffect } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  formatMessage,
  FormattedMessage,
} from "react-intl";
import Select from "react-select";

const CityFilter = (props) => {

  useEffect(() => {
    Meteor.call(
      "people.getAddress",
      { campaignId: Session.get("campaignId") },
      (err, res) => {
        console.log(err)
        console.log(res)
      }
    );

  }, [])

  const _getOptions = () => {

    let options = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

    let options_exact = []; // TODO: modify name of this variable

    let today = new Date();

    for (option of options) {
      gt = new Date();
      lt = new Date();

      switch (option) {
        case "18-24":
          lt.setFullYear(today.getFullYear() - 18);
          gt.setFullYear(today.getFullYear() - 24);
          break;

        case "25-34":
          lt.setFullYear(today.getFullYear() - 25);
          gt.setFullYear(today.getFullYear() - 34);
          break;

        case "35-44":
          lt.setFullYear(today.getFullYear() - 35);
          gt.setFullYear(today.getFullYear() - 44);
          break;

        case "45-54":
          lt.setFullYear(today.getFullYear() - 45);
          gt.setFullYear(today.getFullYear() - 54);
          break;

        case "55-64":
          lt.setFullYear(today.getFullYear() - 55);
          gt.setFullYear(today.getFullYear() - 64);
          break;

        case "65+":
          lt.setFullYear(today.getFullYear() - 65);
          gt.setFullYear(today.getFullYear() - 65);
          break;
      }

      options_exact.push({
        value: { $gt: gt, $lt: lt },
        label: option,
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
      placeholder={props.placeholder || "City"}
      value={_getValue()}
      onChange={_handleChange}
      options={_getOptions()}
    />
  );
};

CityFilter.propTypes = {
  intl: intlShape.isRequired,
};

export default CityFilter;
