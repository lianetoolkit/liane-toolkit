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
        //console.log(res);

        setCities(
          res.map((item) => {
            //console.log(item.campaignMeta?.basic_info?.address?.city);
            if (!item.campaignMeta?.basic_info?.address?.city) {
              return "";
            }
            return item.campaignMeta?.basic_info?.address?.city;
          })
        );
      }
    );
  }, []);

  const _getOptions = () => {
    let options = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

    let options_exact = []; // TODO: modify name of this variable

    let today = new Date();

    for (option of cities) {
      if(!option) {
        continue;
      }
      options_exact.push({
        value: option,
        label: option,
      });
    }

    console.log(options_exact);
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
