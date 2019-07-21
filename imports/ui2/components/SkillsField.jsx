import React, { Component } from "react";
import styled from "styled-components";
import { uniq } from "lodash";

import CreatableSelect from "react-select/lib/Creatable";

export default class SkillsField extends Component {
  static defaultOptions = [
    {
      value: "design",
      label: "Design"
    },
    {
      value: "video",
      label: "Video"
    },
    {
      value: "event_production",
      label: "Event production"
    },
    {
      value: "editor",
      label: "Writing/editing"
    },
    {
      value: "photographer",
      label: "Photography"
    },
    {
      value: "social_media",
      label: "Social media"
    },
    {
      value: "web",
      label: "Web Development"
    },
    {
      value: "panflation",
      label: "Panflation"
    }
  ];
  constructor(props) {
    super(props);
    this.state = {
      options: [...SkillsField.defaultOptions],
      value: []
    };
  }
  componentDidMount() {
    const { value } = this.props;
    if (value && value.length) {
      this.setState({ value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { name, onChange } = this.props;
    const { value } = this.state;
    if (JSON.stringify(value) != JSON.stringify(prevState.value) && onChange) {
      onChange({ target: { name, value } });
    }
  }
  _handleCreateOption = option => {
    this.setState({
      options: [
        {
          value: option,
          label: option
        },
        ...this.state.options
      ],
      value: uniq([...this.state.value, option])
    });
  };
  _handleChange = options => {
    const { name, onChange } = this.props;
    const value = options.map(option => option.value);
    this.setState({ value });
  };
  _buildValue = () => {
    const { value } = this.state;
    let builtValue = [];
    if (value && value.length) {
      for (let val of value) {
        const fromDefault = SkillsField.defaultOptions.find(
          option => option.value == val
        );
        builtValue.push({
          value: val,
          label: fromDefault ? fromDefault.label : val
        });
      }
    }
    return builtValue;
  };
  render() {
    const { name } = this.props;
    const { options } = this.state;
    return (
      <CreatableSelect
        classNamePrefix="select-search"
        cacheOptions
        isMulti
        placeholder="Skills..."
        options={options}
        onCreateOption={this._handleCreateOption}
        onChange={this._handleChange}
        name={name}
        value={this._buildValue()}
      />
    );
  }
}
