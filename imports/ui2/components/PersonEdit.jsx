import React, { Component } from "react";
import styled from "styled-components";
import AsyncCreatableSelect from "react-select/lib/AsyncCreatable";
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
        basic_info: {}
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
  _handleChange = ev => {
    const { formData } = this.state;
    const newFormData = Object.assign({}, formData);
    set(newFormData, ev.target.name, ev.target.value);
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
  render() {
    const { person } = this.props;
    const { sectionKey, formData } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <TabNav>
          <a
            href="javascript:void(0);"
            className={sectionKey == "basic_info" ? "active" : ""}
          >
            Geral
          </a>
          <a href="javascript:void(0);">Contato</a>
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
            <Form.Field label="Tags">
              <TagSelect
                name="basic_info.tags"
                onChange={this._handleChange}
                value={formData.basic_info.tags}
              />
            </Form.Field>
          </div>
        ) : null}
        <input type="submit" value="Salvar alterações" />
      </Form>
    );
  }
}
