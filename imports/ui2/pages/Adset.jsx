import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Page from "../components/Page.jsx";

const Container = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  background: #fff;
`;

export default class AdsetPage extends Component {
  render () {
    return (
      <>
        <Page.Nav full plain />
        <Container />
      </>
    )
  }
}
