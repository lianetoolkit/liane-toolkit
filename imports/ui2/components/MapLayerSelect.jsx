import React, { Component } from "react";
import styled from "styled-components";

import CreatableSelect from "react-select/lib/Creatable";

export default class MapLayerSelect extends Component {
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
    const { name } = this.props;
    const { options } = this.state;
    return (
      <CreatableSelect
        classNamePrefix="select-search"
        cacheOptions
        placeholder="Map layers..."
        options={options}
        onCreateOption={this._handleCreateOption}
        onChange={this._handleChange}
        name={name}
        value={this._buildValue()}
      />
    );
  }
}
