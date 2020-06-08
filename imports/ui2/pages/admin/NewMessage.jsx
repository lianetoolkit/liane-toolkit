import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import Page from "/imports/ui2/components/Page.jsx";
import Form from "/imports/ui2/components/Form.jsx";
import Select from "react-select";
import { languages } from "/locales";
import OrLine from "/imports/ui2/components/OrLine.jsx";
import CountrySelect from "/imports/ui2/components/CountrySelect.jsx";
import CampaignSelect from "/imports/ui2/components/CampaignSelect.jsx";
import UserSelect from "/imports/ui2/components/UserSelect.jsx";
import OfficeField from "/imports/ui2/components/OfficeField.jsx";

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
      formData: {
        title: "",
        content: "",
      },
      filters: {
        target: "users",
      },
    };
  }
  _filledForm = () => {
    return false;
  };
  _handleChange = ({ target }) => {
    const { filters } = this.state;
    this.setState({
      filters: {
        ...filters,
        [target.name]: target.value,
      },
    });
  };
  _handleSelectChange = () => {};
  _getLanguageOptions = () => {
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
    return options;
  };
  render() {
    const { intl } = this.props;
    const { formData, filters } = this.state;
    return (
      <Form>
        <Form.Content>
          <Container>
            <h2>New message</h2>
            <p>Create a message to send to all or selected users.</p>
            <Form.Field big label="Message title">
              <input type="text" name="title" />
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
              <textarea name="content"></textarea>
            </Form.Field>
          </Container>
        </Form.Content>
        <Form.Filters
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
                <UserSelect />
              </Form.Field>
              <OrLine bgColor="#f7f7f7">or filter below</OrLine>
              <Form.Field label="Language">
                <Select
                  classNamePrefix="select-search"
                  isSearchable={true}
                  placeholder="Select a language..."
                  options={this._getLanguageOptions()}
                  onChange={this._handleSelectChange}
                  name="language"
                  // value={}
                />
              </Form.Field>
              <Form.Field label="User type">
                <Select
                  classNamePrefix="select-search"
                  isSearchable={true}
                  placeholder="Select a user type..."
                  options={[
                    {
                      value: "user",
                      label: "User",
                    },
                    {
                      value: "campaigner",
                      label: "Campaigner",
                    },
                  ]}
                  onChange={this._handleSelectChange}
                  name="type"
                  // value={}
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
                <CampaignSelect />
              </Form.Field>
              <OrLine bgColor="#f7f7f7">or filter below</OrLine>
              <Form.Field className="radio-list">
                <label>
                  <input type="checkbox" name="admins" />
                  Send to campaign admins only
                </label>
              </Form.Field>
              <Form.Field label="Country">
                <CountrySelect />
              </Form.Field>
              <Form.Field label="Office">
                <OfficeField
                  country={formData.country}
                  name="office"
                  onChange={this._handleChange}
                />
              </Form.Field>
            </div>
          ) : null}
        </Form.Filters>
        <Form.Actions>
          <div className="info">
            <strong>2</strong> users will receive this message
          </div>
          <input
            type="submit"
            disabled={!this._filledForm() || loading}
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
