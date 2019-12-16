import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import styled from "styled-components";
import Select from "react-select";
import moment from "moment";
import { debounce } from "lodash";

const messages = defineMessages({
  placeholder: {
    id: "app.entry_select.placeholder",
    defaultMessage: "Select a post..."
  }
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

class EntrySelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      entries: [],
      options: []
    };
  }
  componentDidMount() {
    const campaignId = Session.get("campaignId");
    this.setState({ loading: true });
    Meteor.call("entries.byCampaign", { campaignId }, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          entries: res,
          options: this._buildOptions(res)
        });
      }
      this.setState({ loading: false });
    });
  }
  _getId = entry => {
    return entry._id.split("_")[1];
  };
  _handleInputChange = (search, { action }) => {
    if (action == "input-change") {
      this._fetchSearch(search);
    }
  };
  _fetchSearch = debounce(search => {
    this.setState({ loading: true });
    const campaignId = Session.get("campaignId");
    Meteor.call("entries.byCampaign", { campaignId, search }, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          entries: res,
          options: this._buildOptions(res)
        });
      }
      this.setState({ loading: false });
    });
  }, 300);
  _buildOptions = entries => {
    return entries.map(entry => {
      return {
        label: (
          <span className="entry-item">
            <span className="message">{entry.message}</span>
            <span className="date">
              {moment(entry.createdTime).format("LLL")} &middot;{" "}
              {this._getId(entry)}
            </span>
          </span>
        ),
        value: entry._id
      };
    });
  };
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
      return options.find(option => option.value == value);
    }
    return null;
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

EntrySelect.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(EntrySelect);
