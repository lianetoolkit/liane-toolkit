import React, { Component } from "react";
import styled from "styled-components";
import Select from "react-select";
import { get, set } from "lodash";

import Form from "./Form.jsx";
import TabNav from "./TabNav.jsx";
import TagSelect from "./TagSelect.jsx";

export default class PersonEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      sectionKey: "basic_info",
      formData: {
        name: "",
        basic_info: {},
        contact: {}
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
  _handleNavClick = sectionKey => ev => {
    ev.preventDefault();
    this.setState({ sectionKey });
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
  _handleSubmit = ev => {
    ev.preventDefault();
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
        console.log(err, res);
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
  render() {
    const { person } = this.props;
    const { sectionKey, formData } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <TabNav>
          <a
            href="javascript:void(0);"
            className={sectionKey == "basic_info" ? "active" : ""}
            onClick={this._handleNavClick("basic_info")}
          >
            Geral
          </a>
          <a
            href="javascript:void(0);"
            className={sectionKey == "contact" ? "active" : ""}
            onClick={this._handleNavClick("contact")}
          >
            Contato
          </a>
          <a href="javascript:void(0);">Rede sociais</a>
          <a href="javascript:void(0);">Campos extras</a>
        </TabNav>
        {sectionKey == "basic_info" ? (
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
            <Form.Field label="Gênero">
              <Select
                name="basic_info.gender"
                placeholder="Gênero"
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
            <Form.Field label="Tags">
              <TagSelect
                name="basic_info.tags"
                onChange={this._handleChange}
                value={formData.basic_info.tags}
              />
            </Form.Field>
          </div>
        ) : null}
        {sectionKey == "contact" ? (
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
        <input type="submit" value="Salvar alterações" />
      </Form>
    );
  }
}
