import React, { Component } from "react";
import styled from "styled-components";
import { get, set } from "lodash";

import Form from "./Form.jsx";
import TabNav from "./TabNav.jsx";

export default class PersonEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      formData: {
        name: "",
        email: ""
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
    return (
      <Form onSubmit={this._handleSubmit}>
        <TabNav>
          <a href="javascript:void(0);" className="active">
            Geral
          </a>
          <a href="javascript:void(0);">Contato</a>
          <a href="javascript:void(0);">Rede sociais</a>
          <a href="javascript:void(0);">Campos extras</a>
        </TabNav>
        <input type="text" name="name" placeholder="Nome" />
        <input type="email" name="name" placeholder="Email" />
      </Form>
    );
  }
}
