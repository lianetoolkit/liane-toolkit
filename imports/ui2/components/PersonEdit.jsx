import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import moment from "moment";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { get, set } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import { Meta } from "/imports/ui2/utils/people";

import Form from "./Form.jsx";
import TabNav from "./TabNav.jsx";
import TagSelect from "./TagSelect.jsx";
import SkillsField from "./SkillsField.jsx";
import AddressField from "./AddressField.jsx";
import ExtraFields from "./ExtraFields.jsx";
import GenderField from "./GenderField.jsx";

export const profileLabels = defineMessages({
  nameLabel: {
    id: "app.people.profile.name_label",
    defaultMessage: "Name",
  },
  birthdayLabel: {
    id: "app.people.profile.birthday_label",
    defaultMessage: "Birthday",
  },
  genderLabel: {
    id: "app.people.profile.gender_label",
    defaultMessage: "Gender",
  },
  jobLabel: {
    id: "app.people.profile.job_label",
    defaultMessage: "Job/Occupation",
  },
  skillsLabel: {
    id: "app.people.profile.skills_label",
    defaultMessage: "Skills",
  },
  addressLabel: {
    id: "app.people.profile.address_label",
    defaultMessage: "Address",
  },
  tagsLabel: {
    id: "app.people.profile.tags_label",
    defaultMessage: "Tags",
  },
  emailLabel: {
    id: "app.people.profile.email_label",
    defaultMessage: "Email",
  },
  phoneLabel: {
    id: "app.people.profile.phone_label",
    defaultMessage: "Phone number",
  },
});

const messages = defineMessages({
  saveLabel: {
    id: "app.people.edit.save_label",
    defaultMessage: "Save",
  },
});

const Container = styled.div`
  .tab-nav {
    margin: -2rem -3rem 2rem -3rem;
    padding: 1rem 0 0;
  }
  input[type="submit"] {
    margin-top: 1rem;
  }
`;

class PersonEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      sectionKey: "basic_info",
      tab: "basic_info",
      formData: {
        name: "",
        basic_info: {},
        contact: {},
        social_networks: {},
        extra: [],
      },
    };
  }
  static getDerivedStateFromProps({ person }, state) {
    if (person._id && person._id !== state.id) {
      return {
        id: person._id,
        formData: {
          ...state.formData,
          name: person.name,
          ...person.campaignMeta,
        },
      };
    }
    return null;
  }
  _handleNavClick = (tab, sectionKey) => (ev) => {
    ev.preventDefault();
    this.setState({ tab, sectionKey: sectionKey || tab });
  };
  _handleChange = (ev) => {
    const { formData } = this.state;
    const newFormData = Object.assign({}, formData);
    set(newFormData, ev.target.name, ev.target.value);
    this.setState({
      formData: newFormData,
    });
  };
  _handleSelectChange = (selected, { name }) => {
    const { formData } = this.state;
    let value = null;
    if (selected && selected.value) {
      value = selected.value;
    }
    const newFormData = Object.assign({}, formData);
    set(newFormData, name, value);
    this.setState({
      formData: newFormData,
    });
  };
  _handleAddressChange = ({ name, value }) => {
    const { formData } = this.state;
    const newFormData = Object.assign({}, formData);
    set(newFormData, name, value);
    this.setState({
      formData: newFormData,
    });
  };
  _handleExtraFieldsChange = (value) => {
    this.setState({
      formData: {
        ...this.state.formData,
        extra: value,
      },
    });
  };
  _getSkillsOptions = () => {
    const { campaign } = this.props;
    return get(campaign, "forms.skills");
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { onSuccess, onError } = this.props;
    const { id, sectionKey, formData } = this.state;
    const campaignId = Session.get("campaignId");
    const update = (createdId) => {
      let data;
      if (Array.isArray(formData[sectionKey])) {
        data = { [sectionKey]: formData[sectionKey] };
      } else {
        data = formData[sectionKey];
      }
      Meteor.call(
        "people.metaUpdate",
        {
          campaignId: Session.get("campaignId"),
          personId: id || createdId,
          name: formData.name,
          sectionKey,
          data: data,
        },
        (err, res) => {
          if (!err) {
            alertStore.add(null, "success");
            if (onSuccess) {
              onSuccess(res, "updated", formData);
            }
          } else {
            alertStore.add(err);
            if (onError) {
              onError(err);
            }
          }
        }
      );
    };
    if (!id) {
      Meteor.call(
        "people.create",
        { name: formData.name, campaignId },
        (err, res) => {
          if (err) {
            alertStore.add(err);
            if (onError) {
              onError(err);
            }
          } else {
            this.setState({
              id: res,
            });
            update(res);
            if (onSuccess) {
              onSuccess(res, "created", formData);
            }
          }
        }
      );
    } else {
      update();
    }
  };
  getBirthdayValue() {
    const { formData } = this.state;
    const value = get(formData, "basic_info.birthday");
    if (value) {
      return value;
    }
    return null;
  }
  render() {
    const { intl, person } = this.props;
    const { tab, sectionKey, formData } = this.state;
    return (
      <Container>
        <Form onSubmit={this._handleSubmit}>
          <TabNav>
            <a
              href="javascript:void(0);"
              className={tab == "basic_info" ? "active" : ""}
              onClick={this._handleNavClick("basic_info")}
            >
              {intl.formatMessage(Meta.getSectionLabel("general"))}
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "address" ? "active" : ""}
              onClick={this._handleNavClick("address", "basic_info")}
            >
              {intl.formatMessage(Meta.getSectionLabel("address"))}
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "contact" ? "active" : ""}
              onClick={this._handleNavClick("contact")}
            >
              {intl.formatMessage(Meta.getSectionLabel("contact"))}
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "social_networks" ? "active" : ""}
              onClick={this._handleNavClick("social_networks")}
            >
              {intl.formatMessage(Meta.getSectionLabel("networks"))}
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "extra" ? "active" : ""}
              onClick={this._handleNavClick("extra")}
            >
              {intl.formatMessage(Meta.getSectionLabel("extra"))}
            </a>
          </TabNav>
          {tab == "basic_info" ? (
            <div>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("general", "name"))}
              >
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("general", "birthday"))}
              >
                <DatePicker
                  onChange={(date) => {
                    this._handleChange({
                      target: {
                        name: "basic_info.birthday",
                        value: date,
                      },
                    });
                  }}
                  selected={this.getBirthdayValue()}
                  dateFormatCalendar="MMMM"
                  dateFormat="P"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("general", "gender"))}
              >
                <GenderField
                  name="basic_info.gender"
                  onChange={this._handleChange}
                  value={formData.basic_info.gender}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(
                  Meta.getLabel("general", "occupation")
                )}
              >
                <input
                  type="text"
                  name="basic_info.occupation"
                  value={formData.basic_info.occupation}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("general", "skills"))}
              >
                <SkillsField
                  name="basic_info.skills"
                  onChange={this._handleChange}
                  options={this._getSkillsOptions()}
                  value={formData.basic_info.skills}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("general", "tags"))}
              >
                <TagSelect
                  name="basic_info.tags"
                  onChange={this._handleChange}
                  value={formData.basic_info.tags}
                />
              </Form.Field>
            </div>
          ) : null}
          {tab == "address" ? (
            <AddressField
              name="basic_info.address"
              value={formData.basic_info.address}
              onChange={this._handleAddressChange}
            />
          ) : null}
          {tab == "contact" ? (
            <div>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("contact", "email"))}
              >
                <input
                  type="email"
                  name="contact.email"
                  onChange={this._handleChange}
                  value={formData.contact.email}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("contact", "phone"))}
              >
                <input
                  type="text"
                  name="contact.cellphone"
                  onChange={this._handleChange}
                  value={formData.contact.cellphone}
                />
              </Form.Field>
            </div>
          ) : null}
          {tab == "social_networks" ? (
            <div>
              <Form.Field
                label={intl.formatMessage(
                  Meta.getLabel("networks", "instagram")
                )}
              >
                <input
                  type="text"
                  name="social_networks.instagram"
                  placeholder="@instagram"
                  onChange={this._handleChange}
                  value={formData.social_networks.instagram}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(Meta.getLabel("networks", "twitter"))}
              >
                <input
                  type="text"
                  name="social_networks.twitter"
                  placeholder="@twitter"
                  onChange={this._handleChange}
                  value={formData.social_networks.twitter}
                />
              </Form.Field>
            </div>
          ) : null}
          {tab == "extra" ? (
            <div>
              <p>
                <FormattedMessage
                  id="app.people.edit.extra_fields.description"
                  defaultMessage="Add extra fields for this profile."
                />{" "}
                <span style={{ fontStyle: "italic" }}>
                  <FormattedMessage
                    id="app.people.edit.extra_fields.example"
                    defaultMessage="E.g., sign: scorpio"
                  />
                </span>
              </p>
              <ExtraFields
                onChange={this._handleExtraFieldsChange}
                value={formData.extra}
              />
            </div>
          ) : null}
          <input type="submit" value={intl.formatMessage(messages.saveLabel)} />
        </Form>
      </Container>
    );
  }
}

PersonEdit.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonEdit);
