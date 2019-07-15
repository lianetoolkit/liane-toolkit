import React, { Component } from "react";
import styled from "styled-components";

import Page from "../components/Page.jsx";

export default class PeopleSingle extends Component {
  render() {
    const { person } = this.props;
    console.log(person);
    if(person) {
      return (
        <>
          <Page.Nav />
          <Page.Content>
            <h1>{person.name}</h1>
          </Page.Content>
        </>
      );
    }
    return null;
  }
}
