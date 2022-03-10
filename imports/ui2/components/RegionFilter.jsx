import React, { useState, useEffect } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  formatMessage,
  FormattedMessage,
} from "react-intl";
import Select from "react-select";

const RegionFilter = (props) => {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    Meteor.call(
      "people.getAddress",
      { campaignId: Session.get("campaignId") },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        }

        let regions_list = res.map((item) => {
          if (!item.campaignMeta?.basic_info?.address?.region) {
            return "";
          }
          return item.campaignMeta?.basic_info?.address?.region;
        });

        setRegions(new Set(regions_list));
      }
    );
  }, []);

  const _getOptions = () => {
    let options = [];

    for (option of regions) {
      if (!option) {
        continue;
      }

      options.push({
        value: option,
        label: option,
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
      placeholder={props.placeholder || "Region"}
      value={_getValue()}
      onChange={_handleChange}
      options={_getOptions()}
    />
  );
};

RegionFilter.propTypes = {
  intl: intlShape.isRequired,
};

export default RegionFilter;
