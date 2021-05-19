import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import { debounce } from "lodash";
import Page from "/imports/ui2/components/Page.jsx";
import Form from "/imports/ui2/components/Form.jsx";
import Select from "react-select";
import { languages } from "/locales";
import OrLine from "/imports/ui2/components/OrLine.jsx";
import CountrySelect from "/imports/ui2/components/CountrySelect.jsx";
import GeolocationSelect from "/imports/ui2/components/GeolocationSelect.jsx";
import CampaignSelect from "/imports/ui2/components/CampaignSelect.jsx";
import CampaignTypeSelect from "/imports/ui2/components/CampaignTypeSelect.jsx";
import UserSelect from "/imports/ui2/components/UserSelect.jsx";
import OfficeField from "/imports/ui2/components/OfficeField.jsx";
import RegionSelect from "/imports/ui2/components/RegionSelect.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

const messages = defineMessages({
  titleLabel: {
    id: "app.admin.messages.new.title_label",
    defaultMessage: "Message title",
  },
  contentLabel: {
    id: "app.admin.messages.new.content_label",
    defaultMessage: "Message content",
  },
  submitLabel: {
    id: "app.admin.messages.new.submit_label",
    defaultMessage: "Send message",
  },
  confirmLabel: {
    id: "app.admin.messages.new.confirm_label",
    defaultMessage: "Are you sure you'd like to send this message?",
  },
  confirmWithCountLabel: {
    id: "app.admin.messages.new.confirm_with_count_label",
    defaultMessage:
      "Are you sure you'd like to send this message to {count} people?",
  },
});

const Container = styled.div`
  textarea {
    height: 200px;
  }
  .message-filters {
    font-size: 0.9em;
    padding: 1.5rem;
    border-radius: 7px;
    border: 1px solid #ccc;
    color: #333;
    h3 {
      margin: 0 0 0.5rem;
    }
  }
`;

class NewMessagePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabledFormContent: false,
      formData: {
        title: "",
        content: "",
      },
      filters: {
        target: "users",
      },
      audienceCount: 0,
      loading: false,
    };
  }
  componentDidMount() {
    this._countAudience(this.state.filters);
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      JSON.stringify(prevState.filters) != JSON.stringify(this.state.filters)
    ) {
      this._countAudience(this.state.filters);
    }
  }
  _countAudience = debounce(
    (filters) => {
      this.setState({ loading: true });
      Meteor.call("messages.countAudience", filters, (err, res) => {
        this.setState({
          audienceCount: res || 0,
        });
        this.setState({ loading: false });
      });
    },
    200,
    {
      leading: true,
      trailing: false,
    }
  );
  _filledForm = () => {
    const { formData } = this.state;
    return (
      formData.title &&
      formData.content &&
      this.state.audienceCount &&
      !this.state.loading
    );
  };
  _handleContentChange = ({ target }) => {
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        [target.name]: target.value,
      },
    });
  };
  _handleChange = ({ target }) => {
    const { filters } = this.state;
    if (target.name == "target") {
      return this.setState({
        filters: { target: target.value },
      });
    }
    if (target.name == "userId") {
      return this.setState({
        filters: { target: "users", userId: target.value },
      });
    }
    this.setState({
      filters: {
        ...filters,
        [target.name]:
          target.type == "checkbox" ? target.checked : target.value,
      },
    });
  };
  _handleSelectChange = (name) => (selectedOption) => {
    const { filters } = this.state;
    this.setState({
      filters: {
        ...filters,
        [name]: selectedOption ? selectedOption.value : null,
      },
    });
  };
  _getLanguageOptions = (value = false) => {
    let options = [
      {
        value: "",
        label: "All languages",
      },
    ];
    for (const language in languages) {
      options.push({
        value: language,
        label: languages[language],
      });
    }
    if (value !== false) {
      return options.find((option) => option.value == value);
    }
    return options;
  };
  _getUserTypeOptions = (value = false) => {
    const options = [
      {
        value: "user",
        label: "User",
      },
      {
        value: "campaigner",
        label: "Campaigner",
      },
    ];
    if (value !== false) {
      return options.find((option) => option.value == value);
    }
    return options;
  };
  _handleFiltersToggle = (active) => {
    this.setState({
      disabledFormContent: active,
    });
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { intl } = this.props;
    const { audienceCount, formData, filters } = this.state;
    if (
      !confirm(
        audienceCount > 1
          ? intl.formatMessage(messages.confirmWithCountLabel, {
              count: audienceCount,
            })
          : intl.formatMessage(messages.confirmLabel)
      )
    )
      return;
    Meteor.call(
      "messages.new",
      {
        ...formData,
        filters: filters,
      },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add(null, "success");
          FlowRouter.go("/admin/messages");
        }
      }
    );
  };
  render() {
    const { intl } = this.props;
    const { disabledFormContent, formData, filters, audienceCount, loading } =
      this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content disabled={disabledFormContent}>
          <Container>
            <h2>
              <FormattedMessage
                id="app.admin.messages.new.title"
                defaultMessage="New message"
              />
            </h2>
            <p>
              <FormattedMessage
                id="app.admin.messages.new.description"
                defaultMessage="Create a message to send to all or selected users."
              />
            </p>
            <Form.Field big label={intl.formatMessage(messages.titleLabel)}>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={this._handleContentChange}
              />
            </Form.Field>
            <Form.Field
              label={intl.formatMessage(messages.contentLabel)}
              description={
                <FormattedMessage
                  id="app.admin.messages.new.content_description"
                  defaultMessage="You can use {markdown} to format your message"
                  values={{
                    markdown: (
                      <a
                        href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet"
                        rel="external"
                        target="_blank"
                      >
                        markdown
                      </a>
                    ),
                  }}
                />
              }
            >
              <textarea
                name="content"
                value={formData.content}
                onChange={this._handleContentChange}
              ></textarea>
            </Form.Field>
          </Container>
        </Form.Content>
        <Form.Filters
          onToggle={this._handleFiltersToggle}
          header={
            <>
              <h3>
                <FormattedMessage
                  id="app.admin.messages.new.filter_title"
                  defaultMessage="Message audience"
                />
              </h3>
              <p>
                <FormattedMessage
                  id="app.admin.messages.new.filter_description"
                  defaultMessage="Filter which users will receive this message"
                />
              </p>
            </>
          }
        >
          <Form.Field className="radio-list">
            <label>
              <input
                type="radio"
                name="target"
                value="users"
                checked={filters.target == "users"}
                onChange={this._handleChange}
              />
              Users
            </label>
            <label>
              <input
                type="radio"
                name="target"
                value="campaigns"
                checked={filters.target == "campaigns"}
                onChange={this._handleChange}
              />
              Campaigns
            </label>
          </Form.Field>
          {filters.target == "users" ? (
            <div className="user-filters">
              <Form.Field
                label="Single user"
                description="Send to a specific user"
              >
                <UserSelect
                  name="userId"
                  onChange={this._handleChange}
                  value={filters.userId}
                />
              </Form.Field>
              {!filters.userId ? (
                <>
                  <OrLine bgColor="#f7f7f7">or filter below</OrLine>
                  <Form.Field label="Language">
                    <Select
                      classNamePrefix="select-search"
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Select a language..."
                      options={this._getLanguageOptions()}
                      onChange={this._handleSelectChange("userLanguage")}
                      name="userLanguage"
                      value={
                        filters.userLanguage
                          ? this._getLanguageOptions(filters.userLanguage)
                          : null
                      }
                    />
                  </Form.Field>
                  <Form.Field label="User type">
                    <Select
                      classNamePrefix="select-search"
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Select a user type..."
                      options={this._getUserTypeOptions()}
                      onChange={this._handleSelectChange("userType")}
                      name="userType"
                      value={
                        filters.userType
                          ? this._getUserTypeOptions(filters.userType)
                          : null
                      }
                    />
                  </Form.Field>
                </>
              ) : null}
            </div>
          ) : null}
          {filters.target == "campaigns" ? (
            <div className="campaign-filters">
              <Form.Field
                label="Campaigns"
                description="Send to a specific campaigns"
              >
                <CampaignSelect
                  name="campaignId"
                  multiple={true}
                  value={filters.campaignId}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <OrLine bgColor="#f7f7f7">or filter below</OrLine>
              <Form.Field className="radio-list">
                <label>
                  <input
                    type="checkbox"
                    name="campaignAdmins"
                    onChange={this._handleChange}
                    checked={filters.campaignAdmins}
                  />
                  Send to campaign admins only
                </label>
              </Form.Field>
              <Form.Field label="Campaign type">
                <CampaignTypeSelect
                  name="campaignType"
                  clearable={true}
                  value={filters.campaignType}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Country">
                <CountrySelect
                  name="campaignCountry"
                  clearable={true}
                  value={filters.campaignCountry}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Geolocation">
                <GeolocationSelect
                  name="campaignGeolocation"
                  clearable={true}
                  value={filters.campaignGeolocation}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Office">
                <OfficeField
                  country={filters.campaignCountry}
                  placeholder="Select an office position"
                  clearable={true}
                  name="campaignOffice"
                  onChange={this._handleChange}
                />
              </Form.Field>
            </div>
          ) : null}
        </Form.Filters>
        <Form.Actions>
          {loading ? (
            <Loading />
          ) : (
            <div className="info">
              {audienceCount ? (
                <FormattedMessage
                  id="app.admin.messages.new.audience_count"
                  defaultMessage="{count} users will receive this message"
                  values={{ count: <strong>{audienceCount}</strong> }}
                />
              ) : (
                <FormattedMessage
                  id="app.admin.messages.new.no_match"
                  defaultMessage="No match found for selected filters"
                />
              )}
            </div>
          )}
          <input
            type="submit"
            disabled={!this._filledForm()}
            value={intl.formatMessage(messages.submitLabel)}
          />
        </Form.Actions>
      </Form>
    );
  }
}

NewMessagePage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NewMessagePage);
