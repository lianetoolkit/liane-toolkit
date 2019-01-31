import React, { Component } from "react";

import Header from "../components/Header.jsx";
import AppNav from "../components/AppNav.jsx";

export default class DashboardPage extends Component {
  render() {
    return (
      <div>
        <Header />
        <AppNav />
      </div>
    );
  }
}
