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
import CampaignSelect from "/imports/ui2/components/CampaignSelect.jsx";
import UserSelect from "/imports/ui2/components/UserSelect.jsx";
import OfficeField from "/imports/ui2/components/OfficeField.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

const messages = defineMessages({
  submitLabel: {
    id: "app.admin.messages.new.submit_label",
    defaultMessage: "Send message",
  },
});

const Container = styled.div`
  textarea {
    height: 400px;
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
    const { formData, filters } = this.state;
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
          console.log(res);
        }
      }
    );
  };
  render() {
    const { intl } = this.props;
    const {
      disabledFormContent,
      formData,
      filters,
      audienceCount,
      loading,
    } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content disabled={disabledFormContent}>
          <Container>
            <h2>New message</h2>
            <p>Create a message to send to all or selected users.</p>
            <Form.Field big label="Message title">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={this._handleContentChange}
              />
            </Form.Field>
            <Form.Field
              label="Message content"
              description={
                <span>
                  You can use{" "}
                  <a
                    href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet"
                    rel="external"
                    target="_blank"
                  >
                    markdown
                  </a>{" "}
                  to format your message
                </span>
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
              <h3>Message audience</h3>
              <p>Determine which users will receive this message</p>
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
            </div>
          ) : null}
          {filters.target == "campaigns" ? (
            <div className="campaign-filters">
              <Form.Field
                label="Single campaign"
                description="Send to a specific campaign"
              >
                <CampaignSelect
                  name="campaignId"
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
              <Form.Field label="Country">
                <CountrySelect
                  name="campaignCountry"
                  clearable={true}
                  value={filters.campaignCountry}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Office">
                <OfficeField
                  country={filters.campaignCountry}
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
                <span>
                  <strong>{audienceCount}</strong> users will receive this
                  message
                </span>
              ) : (
                "No match found for selected filters"
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
