import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import styled from "styled-components";
import Select from "react-select";
import moment from "moment";
import { debounce, uniqBy } from "lodash";

const messages = defineMessages({
  placeholder: {
    id: "app.user_select.placeholder",
    defaultMessage: "Select a user...",
  },
});

const Container = styled.div`
  .entry-item {
    .message,
    .date {
      display: block;
    }
    .message {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .date {
      font-size: 0.8em;
      color: #666;
    }
  }
`;

import { alertStore } from "../containers/Alerts.jsx";

class UserSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: [],
      options: [],
    };
  }
  componentDidMount() {
    this.setState({ loading: true });
    Meteor.call("users.search", {}, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          users: res,
          options: this._buildOptions(res),
        });
      }
      this.setState({ loading: false });
    });
  }
  _getId = (entry) => {
    return entry._id.split("_")[1];
  };
  _handleInputChange = (search, { action }) => {
    if (action == "input-change") {
      this._fetchSearch(search);
    }
  };
  _fetchSearch = debounce((search) => {
    this.setState({ loading: true });
    Meteor.call("users.search", { search }, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          users: res,
          options: this._buildOptions(res),
        });
      }
      this.setState({ loading: false });
    });
  }, 300);
  _buildOptions = (users) => {
    return uniqBy(users, "_id").map((user) => {
      return {
        label: user.name,
        value: user._id,
      };
    });
  };
  _handleChange = (value) => {
    const { onChange, name } = this.props;
    if (onChange) {
      onChange({ target: { name, value: value ? value.value : null } });
    }
  };
  _buildValue = () => {
    const { options } = this.state;
    const { value } = this.props;
    let option = null;
    if (value && options.length) {
      option = options.find((option) => option.value == value);
    }
    if (!option && value) {
      Meteor.call("users.selectGet", { userId: value }, (err, res) => {
        if (res) {
          this.setState({
            users: [res, ...this.state.users],
            options: this._buildOptions([res, ...this.state.users]),
          });
        }
      });
    }
    return option;
  };
  render() {
    const { loading, options } = this.state;
    const { intl, name, value, placeholder } = this.props;
    return (
      <Container>
        <Select
          isLoading={loading}
          classNamePrefix="select-search"
          cacheOptions
          isClearable={true}
          placeholder={placeholder || intl.formatMessage(messages.placeholder)}
          options={options}
          onChange={this._handleChange}
          onInputChange={this._handleInputChange}
          filterOption={() => true}
          name={name}
          value={this._buildValue()}
        />
      </Container>
    );
  }
}

UserSelect.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(UserSelect);
