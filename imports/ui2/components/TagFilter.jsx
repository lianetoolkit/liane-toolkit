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
  static tagsToOptions(tags) {
    return tags.map(item => {
      return {
        value: item._id,
        label: item.name
      };
    });
  }
  static getDerivedStateFromProps(props, state) {
    if (props.tags && props.tags.length) {
      if (state.options.length) {
        const ids = props.tags.map(tag => tag._id);
        const optionsIds = state.options.map(option => option.value);
        if (JSON.stringify(ids) != JSON.stringify(optionsIds)) {
          return {
            options: TagFilter.tagsToOptions(props.tags)
          };
        } else {
          return null;
        }
      } else {
        return {
          options: TagFilter.tagsToOptions(props.tags)
        };
      }
    }
    return null;
  }
  componentDidMount() {
    if (!this.props.tags || !this.props.tags.length) {
      Meteor.call(
        "people.getTags",
        { campaignId: Session.get("campaignId") },
        (err, res) => {
          this.setState({
            options: TagFilter.tagsToOptions(res || [])
          });
        }
      );
    }
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
