import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import styled from "styled-components";
import Select from "react-select";
import moment from "moment";
import { compact, debounce, uniqBy } from "lodash";

const messages = defineMessages({
  placeholder: {
    id: "app.campaign_select.placeholder",
    defaultMessage: "Select a campaign...",
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

class CampaignSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      campaigns: {},
      options: [],
    };
  }
  componentDidMount() {
    const campaignId = Session.get("campaignId");
    this.setState({ loading: true });
    Meteor.call("campaigns.search", {}, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          campaigns: {
            ...this.state.campaigns,
            ...this._buildCampaignMap(res),
          },
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
    Meteor.call("campaigns.search", { search }, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          campaigns: {
            ...this.state.campaigns,
            ...this._buildCampaignMap(res),
          },
          options: this._buildOptions(res),
        });
      }
      this.setState({ loading: false });
    });
  }, 300);
  _buildCampaignMap = (campaigns) => {
    const map = {};
    if (campaigns) {
      for (const campaign of campaigns) {
        map[campaign._id] = campaign;
      }
    }
    return map;
  };
  _unMap = (campaignMap) => {
    const campaignArr = [];
    for (const campaignId in campaignMap) {
      campaignArr.push(campaignMap[campaignId]);
    }
    return campaignArr;
  };
  _buildOptions = (data) => {
    const { campaigns } = this.state;
    const { value } = this.props;
    let valueOptions = [];
    if (value && value.length) {
      valueOptions = value.map((id) => {
        const campaign = campaigns[id];
        if (campaign) {
          return {
            label: campaign.name,
            value: campaign._id,
          };
        }
      });
    }
    const campaignsOptions = data.map((campaign) => {
      return {
        label: campaign.name,
        value: campaign._id,
      };
    });
    return compact(uniqBy([...valueOptions, ...campaignsOptions], "value"));
  };
  _handleChange = (value) => {
    const { onChange, name } = this.props;
    if (value && !Array.isArray(value)) {
      value = [value];
    }
    if (onChange) {
      onChange({
        target: { name, value: value ? value.map((v) => v.value) : null },
      });
    }
  };
  _buildValue = () => {
    const { options } = this.state;
    let value = [];
    if (this.props.value) {
      if (!Array.isArray(this.props.value)) {
        value = [this.props.value];
      } else {
        value = this.props.value;
      }
    }
    let valueOptions = [];
    if (value.length && options.length) {
      valueOptions = options.filter(
        (option) => value.indexOf(option.value) !== -1
      );
    }
    return valueOptions;
  };
  render() {
    const { loading, options } = this.state;
    const { intl, name, value, multiple, placeholder } = this.props;
    return (
      <Container>
        <Select
          isLoading={loading}
          classNamePrefix="select-search"
          cacheOptions
          isMulti={!!multiple}
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

CampaignSelect.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignSelect);
