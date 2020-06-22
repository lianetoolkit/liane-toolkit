import { ClientStorage } from "meteor/ostrio:cstorage";
import { FormattedMessage } from "react-intl";
import React, { Component } from "react";

import Page from "../../../components/Page.jsx";

export default class SettingsNav extends Component {
  render() {
    const { campaign } = this.props;
    const userId = Meteor.userId();
    const currentRoute = FlowRouter.current().route.name;
    return (
      <Page.Nav>
        <h3>
          <FormattedMessage
            id="app.campaign_settings.title"
            defaultMessage="Campaign settings"
          />
        </h3>
        <a
          href={FlowRouter.path("App.campaign.settings")}
          className={currentRoute == "App.campaign.settings" ? "active" : ""}
        >
          <FormattedMessage
            id="app.campaign_settings.nav.general"
            defaultMessage="General"
          />
        </a>
        {/* <a
          href={FlowRouter.path("App.campaign.facebook")}
          className={currentRoute == "App.campaign.facebook" ? "active" : ""}
        >
          Contas de Facebook
        </a> */}
        <a
          href={FlowRouter.path("App.campaign.connections")}
          className={currentRoute == "App.campaign.connections" ? "active" : ""}
        >
          <FormattedMessage
            id="app.campaign_settings.nav.connections"
            defaultMessage="Connections"
          />
        </a>
        <a
          href={FlowRouter.path("App.campaign.team")}
          className={currentRoute == "App.campaign.team" ? "active" : ""}
        >
          <FormattedMessage
            id="app.campaign_settings.nav.team"
            defaultMessage="Team"
          />
        </a>
        <a
          href={FlowRouter.path("App.campaign.actions")}
          className={currentRoute == "App.campaign.actions" ? "active" : ""}
        >
          <FormattedMessage
            id="app.campaign_settings.nav.actions"
            defaultMessage="Actions"
          />
        </a>
      </Page.Nav>
    );
  }
}
