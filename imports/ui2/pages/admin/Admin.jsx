import React, { Component } from "react";

import Page from "/imports/ui2/components/Page.jsx";

import TicketsContainer from "/imports/ui2/containers/admin/Tickets.jsx";

class AdminContainer extends Component {
  render() {
    const { children } = this.props;
    return (
      <>
        <Page.Nav full>
          <h3>Administration</h3>
          <a href={FlowRouter.path("App.admin", { section: "campaigns" })}>
            Campaigns
          </a>
          <a href={FlowRouter.path("App.admin", { section: "tickets" })}>
            Tickets
          </a>
          <a href={FlowRouter.path("App.admin", { section: "users" })}>Users</a>
          <a href={FlowRouter.path("App.admin", { section: "jobs" })}>Jobs</a>
          <a href={FlowRouter.path("App.admin", { section: "geolocations" })}>
            Geolocations
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
          children = <h2>404 - Not Found</h2>;
          break;
      }
      return <AdminContainer>{children}</AdminContainer>;
    };
  }
};
