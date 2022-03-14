import React, { useState, useEffect } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  formatMessage,
  FormattedMessage,
} from "react-intl";
import Select from "react-select";

const NeighbourhoodFilter = (props) => {
  const [neighbourdhoodies, setNeighbourhoodies] = useState([]);

  useEffect(() => {
    Meteor.call(
      "people.getAddress",
      { campaignId: Session.get("campaignId") },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        }

        setNeighbourhoodies(
          new Set(
            res.map((item) => {
              if (!item.campaignMeta?.basic_info?.address?.neighbourhood) {
                return "";
              }
              return item.campaignMeta?.basic_info?.address?.neighbourhood;
            })
          )
        );
      }
    );
  }, []);

  const _getOptions = () => {
    let options = [];

    let today = new Date();

    for (neighbourhood of neighbourdhoodies) {
      if (!neighbourhood) {
        continue;
      }
      options.push({
        value: neighbourhood,
        label: neighbourhood,
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
      placeholder={props.placeholder || "Neighbourhood"}
      value={_getValue()}
      onChange={_handleChange}
      options={_getOptions()}
    />
  );
};

NeighbourhoodFilter.propTypes = {
  intl: intlShape.isRequired,
};

export default NeighbourhoodFilter;
