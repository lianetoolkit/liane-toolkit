import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import styled from "styled-components";

import CreatableSelect from "react-select/creatable";

const messages = defineMessages({
  placeholder: {
    id: "app.map_layer_select.placeholder",
    defaultMessage: "Select or type to create..."
  }
});

class MapLayerSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: []
    };
  }
  componentDidMount() {
    Meteor.call(
      "mapLayers.byCampaign",
      { campaignId: Session.get("campaignId") },
      (err, res) => {
        this.setState({
          options: (res || []).map(item => {
            return {
              value: item._id,
              label: item.title
            };
          })
        });
      }
    );
  }
  _handleCreateOption = label => {
    const { onChange, name, value } = this.props;
    Meteor.call(
      "mapLayers.create",
      {
        title: label,
        campaignId: Session.get("campaignId")
      },
      (err, res) => {
        if (!err) {
          onChange({
            target: {
              name,
              value: res
            }
          });
          this.setState({
            options: [
              {
                value: res,
                label
              },
              ...this.state.options
            ]
          });
        }
      }
    );
  };
  _handleChange = value => {
    const { onChange, name } = this.props;
    if (onChange) {
      onChange({ target: { name, value: value.value } });
    }
  };
  _buildValue = () => {
    const { options } = this.state;
    const { value } = this.props;
    if (value && options.length) {
      return options.find(option => value.indexOf(option.value) !== -1);
    }
    return null;
  };
  render() {
    const { intl, name, disabled } = this.props;
    const { options } = this.state;
    const value = this._buildValue();
    if (disabled) {
      return <input type="text" disabled value={value ? value.label : ""} />;
    } else {
      return (
        <CreatableSelect
          classNamePrefix="select-search"
          cacheOptions
          placeholder={intl.formatMessage(messages.placeholder)}
          options={options}
          onCreateOption={this._handleCreateOption}
          onChange={this._handleChange}
          name={name}
          value={value}
        />
      );
    }
  }
}

MapLayerSelect.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(MapLayerSelect);
