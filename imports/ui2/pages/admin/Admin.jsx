import React, { Component } from "react";
import { FormattedMessage } from "react-intl";

import Page from "/imports/ui2/components/Page.jsx";

import TicketsContainer from "/imports/ui2/containers/admin/Tickets.jsx";

class AdminContainer extends Component {
  render() {
    const { children } = this.props;
    return (
      <>
        <Page.Nav full>
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
          <a href={FlowRouter.path("App.admin", { section: "tickets" })}>
            <FormattedMessage
              id="app.admin.nav.tickets"
              defaultMessage="Tickets"
            />
          </a>
          <a href={FlowRouter.path("App.admin", { section: "users" })}>
            <FormattedMessage id="app.admin.nav.users" defaultMessage="Users" />
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
  getSection(section = "") {
    let children = null;
    return function(props) {
      switch (section) {
        case "":
          children = <Index {...props} />;
          break;
        case "tickets":
          children = <TicketsContainer {...props} />;
          break;
        default:
          children = <h2>404</h2>;
          break;
      }
      return <AdminContainer>{children}</AdminContainer>;
    };
  }
};
