import { ClientStorage } from "meteor/ostrio:cstorage";
import React, { Component } from "react";

import Page from "../../../components/Page.jsx";

export default class SettingsNav extends Component {
  render() {
    const { campaign } = this.props;
    const userId = Meteor.userId();
    const currentRoute = FlowRouter.current().route.name;
    return (
      <Page.Nav>
        <h3>Campaign settings</h3>
        <a
          href={FlowRouter.path("App.campaign.settings")}
          className={currentRoute == "App.campaign.settings" ? "active" : ""}
        >
          General
        </a>
        {/* <a
          href={FlowRouter.path("App.campaign.facebook")}
          className={currentRoute == "App.campaign.facebook" ? "active" : ""}
        >
          Contas de Facebook
        </a> */}
        <a
          href={FlowRouter.path("App.campaign.team")}
          className={currentRoute == "App.campaign.team" ? "active" : ""}
        >
          Team
        </a>
        {campaign.creatorId == userId ? (
          <a
            href={FlowRouter.path("App.campaign.actions")}
            className={currentRoute == "App.campaign.actions" ? "active" : ""}
          >
            Actions
          </a>
        ) : null}
      </Page.Nav>
    );
  }
}
