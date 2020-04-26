import React, { Component } from "react";
import styled from "styled-components";

import CreatableSelect from "react-select/lib/Creatable";

export default class TagSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: [],
    };
  }
  componentDidMount() {
    Meteor.call(
      "people.getTags",
      { campaignId: Session.get("campaignId") },
      (err, res) => {
        this.setState({
          options: (res || []).map((item) => {
            return {
              value: item._id,
              label: item.name,
            };
          }),
        });
      }
    );
  }
  _handleCreateOption = (label) => {
    const { onChange, name, value } = this.props;
    Meteor.call(
      "people.createTag",
      {
        name: label,
        campaignId: Session.get("campaignId"),
      },
      (err, res) => {
        if (!err && res) {
          this.setState({
            options: [
              {
                value: res,
                label,
              },
              ...this.state.options,
            ],
          });
          if (onChange) {
            onChange({
              target: {
                name,
                value: [...(value || []), res],
              },
            });
          }
        }
      }
    );
  };
  _handleChange = (value) => {
    const { onChange, name } = this.props;
    if (onChange) {
      onChange({ target: { name, value: value.map((item) => item.value) } });
    }
  };
  _buildValue = () => {
    const { options } = this.state;
    const { value } = this.props;
    if (value && options.length) {
      return options.filter((option) => value.indexOf(option.value) !== -1);
    }
    return [];
  };
  render() {
    const { name, placeholder } = this.props;
    const { options } = this.state;
    return (
      <CreatableSelect
        classNamePrefix="select-search"
        isMulti
        placeholder={placeholder || "Tags..."}
        options={options}
        onCreateOption={this._handleCreateOption}
        onChange={this._handleChange}
        name={name}
        value={this._buildValue()}
      />
    );
  }
}
