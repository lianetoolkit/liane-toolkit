import React, { Component } from "react";
import styled from "styled-components";

import Page from "../components/Page.jsx";

const Container = styled.div``;

export default class CommentsPage extends Component {
  render() {
    return (
      <>
        <Page.Nav />
        <Container />
      </>
    );
  }
}
