import React, { Component } from "react";
import { FormattedMessage } from "react-intl";

import Page from "/imports/ui2/components/Page.jsx";

import TicketsContainer from "/imports/ui2/containers/admin/Tickets.jsx";
import InvitesContainer from "/imports/ui2/containers/admin/Invites.jsx";
import CampaignsContainer from "/imports/ui2/containers/admin/Campaigns.jsx";
import UsersContainer from "/imports/ui2/containers/admin/Users.jsx";
import GeolocationsContainer from "/imports/ui2/containers/admin/Geolocations.jsx";
import JobsContainer from "/imports/ui2/containers/admin/Jobs.jsx";
import MessagesPage from "/imports/ui2/containers/admin/Messages.jsx";

import NewMessagePage from "/imports/ui2/pages/admin/NewMessage.jsx";

class AdminContainer extends Component {
  render() {
    const { children, full } = this.props;
    return (
      <>
        <Page.Nav full={full}>
          <h3>
            <FormattedMessage
              id="app.admin.nav.title"
              defaultMessage="Administration"
            />
          </h3>
          <a href={FlowRouter.path("App.admin", { section: "campaigns" })}>
            <FormattedMessage
              id="app.admin.nav.campaigns"
              defaultMessage="Campaigns"
            />
          </a>
          <a href={FlowRouter.path("App.admin", { section: "invites" })}>
            <FormattedMessage
              id="app.admin.nav.invites"
              defaultMessage="Invites"
            />
          </a>
          <a href={FlowRouter.path("App.admin", { section: "tickets" })}>
            <FormattedMessage
              id="app.admin.nav.tickets"
              defaultMessage="Tickets"
            />
          </a>
          <a href={FlowRouter.path("App.admin", { section: "users" })}>
            <FormattedMessage id="app.admin.nav.users" defaultMessage="Users" />
          </a>
          <a href={FlowRouter.path("App.admin", { section: "messages" })}>
            <FormattedMessage
              id="app.admin.nav.messages"
              defaultMessage="Messages"
            />
          </a>
          <a href={FlowRouter.path("App.admin", { section: "jobs" })}>
            <FormattedMessage id="app.admin.nav.jobs" defaultMessage="Jobs" />
          </a>
          <a href={FlowRouter.path("App.admin", { section: "geolocations" })}>
            <FormattedMessage
              id="app.admin.nav.geolocations"
              defaultMessage="Geolocations"
            />
          </a>
        </Page.Nav>
        {children}
      </>
    );
  }
}

export class Index extends Component {
  render() {
    return null;
  }
}

export default {
  getSection(section = "", subsection = "") {
    let full = true;
    let children = null;
    return function (props) {
      switch (section) {
        case "":
          children = <Index {...props} />;
          break;
        case "tickets":
          children = <TicketsContainer {...props} />;
          break;
        case "campaigns":
          children = <CampaignsContainer {...props} />;
          break;
        case "invites":
          children = <InvitesContainer {...props} />;
          break;
        case "geolocations":
          children = <GeolocationsContainer {...props} />;
          break;
        case "users":
          children = <UsersContainer {...props} />;
          break;
        case "messages":
          if (subsection == "new") {
            full = false;
            children = <NewMessagePage {...props} />;
          } else {
            children = <MessagesPage {...props} />;
          }
          break;
        case "jobs":
          children = <JobsContainer {...props} />;
          break;
        default:
          children = <h2>404</h2>;
          break;
      }
      return <AdminContainer full={full}>{children}</AdminContainer>;
    };
  },
};
