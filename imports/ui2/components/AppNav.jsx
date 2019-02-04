import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import NotificationsPopup from "./NotificationsPopup.jsx";

const Container = styled.nav`
  flex: 0;
  background: #fff;
  padding: 1rem 0;
  font-size: 0.8em;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.125);
  border-bottom: 1px solid #ddd;
  .link-group > * {
    display: inline-block;
    color: #333;
    padding: 0.25rem 1rem;
    border-radius: 3rem;
    border: 1px solid rgba(0, 0, 0, 0.15);
    margin: 0 0.5rem;
    text-decoration: none;
    &.icon-link {
      padding: 0.2rem 0.5rem;
      border-radius: 100%;
      font-size: 1.2em;
    }
    &:hover,
    &:active,
    &:focus {
      color: #000;
      border-color: #333;
    }
    &.active {
      background: #fc0;
      border-color: #fc0;
    }
  }
  .nav-content {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    > * {
      margin: 0 -0.5rem;
    }
    .features {
      flex-grow: 1;
    }
  }
`;

export default class AppNav extends Component {
  render() {
    return (
      <Container>
        <div className="nav-content">
          <div className="features link-group">
            <a href="#" className="active">
              Campanha
            </a>
            <a href="#">Temas</a>
            <a href="#">Pessoas</a>
            <a href="#">Locais</a>
          </div>
          <div className="meta link-group">
            <a href="#" title="Settings" className="icon-link">
              <FontAwesomeIcon icon="cog" />
            </a>
            <NotificationsPopup className="icon-link">
              <FontAwesomeIcon icon="bell" />
            </NotificationsPopup>
          </div>
        </div>
      </Container>
    );
  }
}
