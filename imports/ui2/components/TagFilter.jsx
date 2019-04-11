import React, { Component } from "react";
import Select from "react-select";

export default class TagFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: []
    };
  }
  componentDidMount() {
    Meteor.call(
      "people.getTags",
      { campaignId: Session.get("campaignId") },
      (err, res) => {
        this.setState({
          options: (res || []).map(item => {
            return {
              value: item._id,
              label: item.name
            };
          })
        });
      }
    );
  }
  _handleChange = value => {
    const { onChange, name } = this.props;
    if (onChange) {
      onChange({ target: { name, value: value ? value.value : null } });
    }
  };
  _buildValue = () => {
    const { options } = this.state;
    const { value } = this.props;
    if (value && options.length) {
      return options.find(option => value == option.value);
    }
    return null;
  };
  render() {
    const { name, placeholder } = this.props;
    const { options } = this.state;
    return (
      <Select
        classNamePrefix="select"
        isSearchable={false}
        isClearable={true}
        options={options}
        value={this._buildValue()}
        onChange={this._handleChange}
        name={name}
        placeholder={placeholder || "Tags"}
      />
    );
  }
}
