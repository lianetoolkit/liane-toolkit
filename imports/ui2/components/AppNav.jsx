import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Dropdown from "./AppNavDropdown.jsx";
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
    &.featured {
      font-weight: 600;
    }
    &.clean {
      border: 0;
    }
    .fa-chevron-down {
      margin-left: 0.5rem;
      font-weight: normal;
      font-size: 0.9em;
    }
  }
  .nav-content {
    max-width: 960px;
    padding: 0 2rem;
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

class NavItem extends Component {
  render() {
    const { active, clean, featured, children, href, ...props } = this.props;
    let className = "";
    if (active) className += " active";
    if (featured) className += " featured";
    if (clean) className += " clean";
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  }
}

class SettingsNav extends Component {
  _logout = () => ev => {
    ev.preventDefault();
    Meteor.logout();
  };
  render() {
    return (
      <Dropdown
        width="200px"
        height="auto"
        className="icon-link"
        trigger={<FontAwesomeIcon icon="cog" />}
      >
        <Dropdown.Content>
          <Dropdown.NavItem href={FlowRouter.path("App.campaign.settings")}>
            Configurações da campanha
          </Dropdown.NavItem>
          <Dropdown.Separator />
          <Dropdown.NavItem href="#">Nova campanha</Dropdown.NavItem>
          <Dropdown.Separator />
          <Dropdown.NavItem href="#">Minha conta</Dropdown.NavItem>
          <Dropdown.NavItem href="javascript:void(0);" onClick={this._logout()}>
            Sair
          </Dropdown.NavItem>
        </Dropdown.Content>
      </Dropdown>
    );
  }
}

export default class AppNav extends Component {
  render() {
    const currentRoute = FlowRouter.current().route.name;
    return (
      <Container>
        <div className="nav-content">
          <div className="features link-group">
            <NavItem
              href={FlowRouter.path("App.dashboard")}
              active={currentRoute.indexOf("App.dashboard") === 0}
              featured={true}
            >
              Campanha
              <FontAwesomeIcon icon="chevron-down" />
            </NavItem>
            <NavItem href="#">Temas</NavItem>
            <NavItem
              href={FlowRouter.path("App.people")}
              active={currentRoute.indexOf("App.people") === 0}
            >
              Pessoas
            </NavItem>
            <NavItem
              href={FlowRouter.path("App.map")}
              active={currentRoute.indexOf("App.map") === 0}
            >
              Locais
            </NavItem>
            <NavItem
              href="#"
              active={currentRoute.indexOf("App.chatbot") === 0}
            >
              Chatbot
            </NavItem>
          </div>
          <div className="meta link-group">
            <SettingsNav />
            <NotificationsPopup className="icon-link">
              <FontAwesomeIcon icon="bell" />
            </NotificationsPopup>
          </div>
        </div>
      </Container>
    );
  }
}
