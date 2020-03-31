import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import moment from "moment";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { get, set } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Form from "./Form.jsx";
import TabNav from "./TabNav.jsx";
import TagSelect from "./TagSelect.jsx";
import SkillsField from "./SkillsField.jsx";
import AddressField from "./AddressField.jsx";
import ExtraFields from "./ExtraFields.jsx";

export const genderLabels = defineMessages({
  cis_woman: {
    id: "app.people.gender.cis_woman",
    defaultMessage: "Cisgender woman"
  },
  cis_man: {
    id: "app.people.gender.cis_man",
    defaultMessage: "Cisgender man"
  },
  trans_woman: {
    id: "app.people.gender.trans_woman",
    defaultMessage: "Trans woman"
  },
  trans_man: {
    id: "app.people.gender.trans_man",
    defaultMessage: "Trans man"
  },
  transvestite: {
    id: "app.people.gender.transvestite",
    defaultMessage: "Transvestite"
  },
  non_binary: {
    id: "app.people.gender.non_binary",
    defaultMessage: "Non binary"
  }
});

export const profileLabels = defineMessages({
  nameLabel: {
    id: "app.people.profile.name_label",
    defaultMessage: "Name"
  },
  birthdayLabel: {
    id: "app.people.profile.birthday_label",
    defaultMessage: "Birthday"
  },
  genderLabel: {
    id: "app.people.profile.gender_label",
    defaultMessage: "Gender"
  },
  jobLabel: {
    id: "app.people.profile.job_label",
    defaultMessage: "Job/Occupation"
  },
  skillsLabel: {
    id: "app.people.profile.skills_label",
    defaultMessage: "Skills"
  },
  addressLabel: {
    id: "app.people.profile.address_label",
    defaultMessage: "Address"
  },
  tagsLabel: {
    id: "app.people.profile.tags_label",
    defaultMessage: "Tags"
  },
  emailLabel: {
    id: "app.people.profile.email_label",
    defaultMessage: "Email"
  },
  phoneLabel: {
    id: "app.people.profile.phone_label",
    defaultMessage: "Phone number"
  }
});

const messages = defineMessages({
  saveLabel: {
    id: "app.people.edit.save_label",
    defaultMessage: "Save"
  }
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
        extra: []
      }
    };
  }
  static getDerivedStateFromProps({ person }, state) {
    if (person._id && person._id !== state.id) {
      return {
        id: person._id,
        formData: {
          ...state.formData,
          name: person.name,
          ...person.campaignMeta
        }
      };
    }
    return null;
  }
  _handleNavClick = (tab, sectionKey) => ev => {
    ev.preventDefault();
    this.setState({ tab, sectionKey: sectionKey || tab });
  };
  _handleChange = ev => {
    const { formData } = this.state;
    const newFormData = Object.assign({}, formData);
    set(newFormData, ev.target.name, ev.target.value);
    this.setState({
      formData: newFormData
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
      formData: newFormData
    });
  };
  _handleAddressChange = ({ name, value }) => {
    const { formData } = this.state;
    const newFormData = Object.assign({}, formData);
    set(newFormData, name, value);
    this.setState({
      formData: newFormData
    });
  };
  _handleExtraFieldsChange = value => {
    this.setState({
      formData: {
        ...this.state.formData,
        extra: value
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { onSuccess, onError } = this.props;
    const { id, sectionKey, formData } = this.state;
    const campaignId = Session.get("campaignId");
    const update = createdId => {
      Meteor.call(
        "people.metaUpdate",
        {
          campaignId: Session.get("campaignId"),
          personId: id || createdId,
          name: formData.name,
          sectionKey,
          data: formData[sectionKey]
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
              id: res
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
  genderOptions = [
    "cis_woman",
    "cis_man",
    "trans_woman",
    "trans_man",
    "transvestite",
    "non_binary"
  ];
  getGenderOptions = () => {
    const { intl } = this.props;
    let options = [];
    for (const option of this.genderOptions) {
      options.push({
        value: option,
        label: genderLabels[option]
          ? intl.formatMessage(genderLabels[option])
          : option
      });
    }
    return options;
  };
  getGenderValue = () => {
    const { intl } = this.props;
    const { formData } = this.state;
    const value = get(formData, "basic_info.gender");
    if (value && this.genderOptions.find(option => option == value)) {
      return {
        value,
        label: intl.formatMessage(genderLabels[value])
      };
    }
    return null;
  };
  getBirthdayValue() {
    const { formData } = this.state;
    const value = get(formData, "basic_info.birthday");
    if (value) {
      return moment(value);
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
              <FormattedMessage
                id="app.people.edit.general_label"
                defaultMessage="General"
              />
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "address" ? "active" : ""}
              onClick={this._handleNavClick("address", "basic_info")}
            >
              <FormattedMessage
                id="app.people.edit.address_label"
                defaultMessage="Address"
              />
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "contact" ? "active" : ""}
              onClick={this._handleNavClick("contact")}
            >
              <FormattedMessage
                id="app.people.edit.contact_label"
                defaultMessage="Contact info"
              />
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "social_networks" ? "active" : ""}
              onClick={this._handleNavClick("social_networks")}
            >
              <FormattedMessage
                id="app.people.edit.social_networks_label"
                defaultMessage="Social networks"
              />
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "extra" ? "active" : ""}
              onClick={this._handleNavClick("extra")}
            >
              <FormattedMessage
                id="app.people.edit.extra_fields_label"
                defaultMessage="Extra fields"
              />
            </a>
          </TabNav>
          {tab == "basic_info" ? (
            <div>
              <Form.Field label={intl.formatMessage(profileLabels.nameLabel)}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(profileLabels.birthdayLabel)}
              >
                <DatePicker
                  onChange={date => {
                    this._handleChange({
                      target: {
                        name: "basic_info.birthday",
                        value: date.toDate()
                      }
                    });
                  }}
                  selected={this.getBirthdayValue()}
                  dateFormatCalendar="MMMM"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(profileLabels.genderLabel)}>
                <Select
                  classNamePrefix="select"
                  name="basic_info.gender"
                  placeholder="Gender"
                  isSearchable={false}
                  value={this.getGenderValue()}
                  onChange={this._handleSelectChange}
                  options={this.getGenderOptions()}
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(profileLabels.jobLabel)}>
                <input
                  type="text"
                  name="basic_info.occupation"
                  value={formData.basic_info.occupation}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(profileLabels.skillsLabel)}>
                <SkillsField
                  name="basic_info.skills"
                  onChange={this._handleChange}
                  value={formData.basic_info.skills}
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(profileLabels.tagsLabel)}>
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
              <Form.Field label={intl.formatMessage(profileLabels.emailLabel)}>
                <input
                  type="email"
                  name="contact.email"
                  onChange={this._handleChange}
                  value={formData.contact.email}
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(profileLabels.phoneLabel)}>
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
              <Form.Field label="Instagram">
                <input
                  type="text"
                  name="social_networks.instagram"
                  placeholder="@instagram"
                  onChange={this._handleChange}
                  value={formData.social_networks.instagram}
                />
              </Form.Field>
              <Form.Field label="Twitter">
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
  intl: intlShape.isRequired
};

export default injectIntl(PersonEdit);
