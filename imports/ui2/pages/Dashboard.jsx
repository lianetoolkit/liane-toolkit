import React, { Component } from "react";

import Page from "../components/Page.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AppNav from "../components/AppNav.jsx";
import Dashboard from "../components/Dashboard.jsx";

export default class DashboardPage extends Component {
  render() {
    return (
      <Page>
        <Header />
        <AppNav />
        <Dashboard>
          <Dashboard.Row>
            <Dashboard.Box grow="2">
              <p>Teste</p>
            </Dashboard.Box>
            <Dashboard.Box grow="1">
              <p>Teste</p>
              <p>Teste</p>
              <p>Teste</p>
              <p>Teste</p>
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
        <Footer />
      </Page>
    );
  }
}
