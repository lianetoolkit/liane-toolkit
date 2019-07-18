import React, { Component } from "react";

import Page from "../../../components/Page.jsx";

export default class SettingsNav extends Component {
  render() {
    const currentRoute = FlowRouter.current().route.name;
    return (
      <Page.Nav>
        <h3>Configurações da campanha</h3>
        <a
          href={FlowRouter.path("App.campaign.settings")}
          className={currentRoute == "App.campaign.settings" ? "active" : ""}
        >
          Configurações gerais
        </a>
        <a
          href={FlowRouter.path("App.campaign.accounts")}
          className={currentRoute == "App.campaign.accounts" ? "active" : ""}
        >
          Contas de Facebook
        </a>
        <a href="javascript:void(0);">Equipe</a>
        <a
          href={FlowRouter.path("App.campaign.actions")}
          className={currentRoute == "App.campaign.actions" ? "active" : ""}
        >
          Ações
        </a>
      </Page.Nav>
    );
  }
}
