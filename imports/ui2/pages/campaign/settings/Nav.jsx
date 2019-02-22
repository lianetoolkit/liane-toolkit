import React, { Component } from "react";

import Page from "../../../components/Page.jsx";

export default class SettingsNav extends Component {
  state = { active: 0 };
  _go = active => () => {
    this.setState({ active });
  };
  render() {
    const { active } = this.state;
    return (
      <Page.Nav>
        <h3>Configurações da campanha</h3>
        <a
          href="javascript:void(0);"
          className={active == 0 ? "active" : ""}
          onClick={this._go(0)}
        >
          Configurações gerais
        </a>
        <a
          href="javascript:void(0);"
          className={active == 1 ? "active" : ""}
          onClick={this._go(1)}
        >
          Formulários
        </a>
        <a
          href="javascript:void(0);"
          className={active == 2 ? "active" : ""}
          onClick={this._go(2)}
        >
          Contas de Facebook
        </a>
        <a
          href="javascript:void(0);"
          className={active == 3 ? "active" : ""}
          onClick={this._go(3)}
        >
          Equipe
        </a>
        <a
          href="javascript:void(0);"
          className={active == 4 ? "active" : ""}
          onClick={this._go(4)}
        >
          Ações
        </a>
      </Page.Nav>
    );
  }
}
