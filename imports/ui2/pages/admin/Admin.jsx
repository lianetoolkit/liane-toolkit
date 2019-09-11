import React, { Component } from "react";

import Page from "/imports/ui2/components/Page.jsx";

export default class AdminPage extends Component {
  render() {
    return (
      <>
        <Page.Nav>
          <h3>Administration</h3>
          <a href="javascript:void(0);">Campaigns</a>
          <a href="javascript:void(0);">Tickets</a>
          <a href="javascript:void(0);">Users</a>
          <a href="javascript:void(0);">Jobs</a>
          <a href="javascript:void(0);">Geolocations</a>
        </Page.Nav>
        <Page.Content>
          <h2>Administration</h2>
        </Page.Content>
      </>
    );
  }
}
