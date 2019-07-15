import React, { Component } from "react";
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

const Container = styled.div`
  .tab-nav {
    margin: -2rem -2rem 2rem -2rem;
    padding: 1rem 0 0;
  }
  input[type="submit"] {
    margin-top: 1rem;
  }
`;

export default class PersonEdit extends Component {
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
    if (person._id !== state.id) {
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
    Meteor.call(
      "people.metaUpdate",
      {
        campaignId: Session.get("campaignId"),
        personId: id,
        name: formData.name,
        sectionKey,
        data: formData[sectionKey]
      },
      (err, res) => {
        if (!err) {
          alertStore.add("Perfil atualizado com sucesso.", "success");
          if (onSuccess) {
            onSuccess(res);
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
  genderOptions = [
    {
      value: "cis_woman",
      label: "Mulher cisgênero"
    },
    {
      value: "cis_man",
      label: "Homem cisgênero"
    },
    {
      value: "trans_woman",
      label: "Mulher transsexual"
    },
    {
      value: "trans_man",
      label: "Homem transsexual"
    },
    {
      value: "transvestite",
      label: "Travesti"
    },
    {
      value: "non_binary",
      label: "Não binário"
    }
  ];
  getGenderValue() {
    const { formData } = this.state;
    const value = get(formData, "basic_info.gender");
    if (value) {
      return this.genderOptions.find(option => option.value == value);
    }
    return null;
  }
  getBirthdayValue() {
    const { formData } = this.state;
    const value = get(formData, "basic_info.birthday");
    if (value) {
      return moment(value);
    }
    return null;
  }
  render() {
    const { person } = this.props;
    const { tab, sectionKey, formData } = this.state;
    return (
      <Container>
        <Form onSubmit={this._handleSubmit}>
          <TabNav dark>
            <a
              href="javascript:void(0);"
              className={tab == "basic_info" ? "active" : ""}
              onClick={this._handleNavClick("basic_info")}
            >
              Geral
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "address" ? "active" : ""}
              onClick={this._handleNavClick("address", "basic_info")}
            >
              Endereço
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "contact" ? "active" : ""}
              onClick={this._handleNavClick("contact")}
            >
              Contato
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "social_networks" ? "active" : ""}
              onClick={this._handleNavClick("social_networks")}
            >
              Rede sociais
            </a>
            <a
              href="javascript:void(0);"
              className={tab == "extra" ? "active" : ""}
              onClick={this._handleNavClick("extra")}
            >
              Campos extras
            </a>
          </TabNav>
          {tab == "basic_info" ? (
            <div>
              <Form.Field label="Nome">
                <input
                  type="text"
                  name="name"
                  placeholder="Nome"
                  value={formData.name}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Data de nascimento">
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
              <Form.Field label="Gênero">
                <Select
                  classNamePrefix="select"
                  name="basic_info.gender"
                  placeholder="Gênero"
                  isSearchable={false}
                  value={this.getGenderValue()}
                  onChange={this._handleSelectChange}
                  options={this.genderOptions}
                />
              </Form.Field>
              <Form.Field label="Ocupação">
                <input
                  type="text"
                  name="basic_info.occupation"
                  placeholder="Ocupação"
                  value={formData.basic_info.occupation}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Habilidades">
                <SkillsField
                  name="basic_info.skills"
                  onChange={this._handleChange}
                  value={formData.basic_info.skills}
                />
              </Form.Field>
              <Form.Field label="Tags">
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
              <Form.Field label="Email">
                <input
                  type="email"
                  name="contact.email"
                  placeholder="Email"
                  onChange={this._handleChange}
                  value={formData.contact.email}
                />
              </Form.Field>
              <Form.Field label="Telefone celular">
                <input
                  type="text"
                  name="contact.cellphone"
                  placeholder="Telefone celular"
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
                Adicione campos adicionais sobre essa pessoa. Por exemplo,{" "}
                <span style={{ fontStyle: "italic" }}>signo: escorpião</span>.
              </p>
              <ExtraFields
                onChange={this._handleExtraFieldsChange}
                value={formData.extra}
              />
            </div>
          ) : null}
          <input type="submit" value="Salvar alterações" />
        </Form>
      </Container>
    );
  }
}
