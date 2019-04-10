import React, { Component } from "react";
import styled from "styled-components";
import AsyncCreatableSelect from "react-select/lib/AsyncCreatable";
import { get, set } from "lodash";

import Form from "./Form.jsx";
import TabNav from "./TabNav.jsx";

export default class PersonEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      sectionKey: "basic_info",
      formData: {
        name: "",
        tags: []
      }
    };
  }
  static getDerivedStateFromProps({ person }, { id }) {
    if (person._id !== id) {
      return {
        formData: {
          name: person.name,
          ...person.campaignMeta
        }
      };
    }
    return null;
  }
  _handleChange = ev => {
    const { formData } = this.state;
  };
  _handleSubmit = ev => {
    ev.preventDefault();
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
              <input type="text" name="name" placeholder="Nome" />
            </Form.Field>
            <Form.Field label="Tags">
              <AsyncCreatableSelect
                classNamePrefix="select"
                cacheOptions
                isMulti
                placeholder="Tags..."
              />
            </Form.Field>
          </div>
        ) : null}
        <input type="submit" value="Salvar alterações" />
      </Form>
    );
  }
}
