import React, { Component } from "react";

import Page from "../components/Page.jsx";
import Dashboard from "../components/Dashboard.jsx";

import PeopleBlock from "../components/blocks/PeopleBlock.jsx";

export default class DashboardPage extends Component {
  render() {
    const { campaignId } = this.props;
    return (
      <Dashboard>
        <Dashboard.Row>
          <Dashboard.Box grow="2">
            <Dashboard.Title>Teste</Dashboard.Title>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box grow="2" attached>
            <PeopleBlock
              query={{
                campaignId,
                query: {
                  "campaignMeta.volunteer": true
                },
                options: {}
              }}
            />
          </Dashboard.Box>
          <Dashboard.Box primary={true}>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
      </Dashboard>
    );
  }
}
