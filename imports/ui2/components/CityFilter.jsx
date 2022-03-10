import React, { useState, useEffect } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  formatMessage,
  FormattedMessage,
} from "react-intl";
import Select from "react-select";

const CityFilter = (props) => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    Meteor.call(
      "people.getAddress",
      { campaignId: Session.get("campaignId") },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        }
        setCities(
          new Set(
            res.map((item) => {
              if (!item.campaignMeta?.basic_info?.address?.city) {
                return "";
              }
              return item.campaignMeta?.basic_info?.address?.city;
            })
          )
        );
      }
    );
  }, []);

  const _getOptions = () => {
    let options = [];

    let today = new Date();

    for (city of cities) {
      if (!city) {
        continue;
      }
      options.push({
        value: city,
        label: city,
      });
    }

    return options;
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
