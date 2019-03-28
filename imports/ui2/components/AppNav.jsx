import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { find } from "lodash";

import Dropdown from "./AppNavDropdown.jsx";
import NotificationsNav from "./NotificationsPopup.jsx";

const Container = styled.nav`
  flex: 0;
  background: #fff;
  font-size: 0.8em;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.125);
  border-bottom: 1px solid #ddd;
  position: relative;
  padding-top: 0.6rem;
  z-index: 10;
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    li {
      display: inline-block;
      position: relative;
      a {
        display: block;
        padding: 0.4rem 1rem 1rem;
        text-decoration: none;
        color: #333;
        font-weight: 600;
      }
      &:hover,
      &:active,
      &:focus {
        > a {
          background: #444;
          color: #fff;
        }
      }
      &.active {
        > a {
          color: #fc0;
        }
      }
      ul {
        display: none;
        min-width: 200px;
        background: #444;
        border-right: 1px solid #333;
        border-left: 1px solid #333;
        border-bottom: 1px solid #333;
        box-shadow: 0 0.25rem 0.4rem rgba(0, 0, 0, 0.1);
        padding: 0 0 0.5rem;
        border-radius: 0 0 7px 7px;
        li {
          display: block;
          a {
            color: #fff;
            padding: 0.5rem 1rem;
          }
          &:hover {
            a {
              background: #333;
            }
          }
        }
      }
      &:hover {
        z-index: 2;
        ul {
          display: block;
          position: absolute;
          top: 100%;
          left: 0;
        }
      }
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
    const {
      active,
      clean,
      featured,
      children,
      href,
      name,
      ...props
    } = this.props;
    let className = "";
    if (active) className += " active";
    if (featured) className += " featured";
    if (clean) className += " clean";
    return (
      <li className={className}>
        <a href={href} {...props}>
          {name}
        </a>
        {children}
      </li>
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
          <Dropdown.NavItem href={FlowRouter.path("App.campaign.new")}>
            Nova campanha
          </Dropdown.NavItem>
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

class CampaignNav extends Component {
  _handleClick = campaignId => ev => {
    ev.preventDefault();
    Session.set("campaignId", campaignId);
  };
  render() {
    const { campaigns } = this.props;
    return (
      <Dropdown
        width="200px"
        height="auto"
        className="icon-link"
        trigger={<FontAwesomeIcon icon="chevron-down" />}
      >
        <Dropdown.Content>
          {campaigns.map(campaign => (
            <Dropdown.NavItem
              key={campaign._id}
              href="javascript:void(0);"
              onClick={this._handleClick(campaign._id)}
            >
              {campaign.name}
            </Dropdown.NavItem>
          ))}
        </Dropdown.Content>
      </Dropdown>
    );
  }
}

export default class AppNav extends Component {
  render() {
    const { campaigns, campaign } = this.props;
    const currentRoute = FlowRouter.current().route.name;
    return (
      <Container>
        <div className="nav-content">
          <div className="features link-group">
            {campaign ? (
              <ul>
                <NavItem
                  href={FlowRouter.path("App.dashboard")}
                  active={currentRoute.indexOf("App.dashboard") === 0}
                  featured={true}
                  name={campaign.name}
                />
                {campaigns.length > 1 ? (
                  <CampaignNav campaigns={campaigns} />
                ) : null}
                <NavItem href="#" name="Inteligência">
                  <ul>
                    <li>
                      <a href="#">Minha audiência</a>
                    </li>
                    <li>
                      <a href="#">Territórios</a>
                    </li>
                  </ul>
                </NavItem>
                <NavItem href="#" name="Comunicação">
                  <ul>
                    <li>
                      <a href={FlowRouter.path("App.people")}>
                        Diretório de contatos
                      </a>
                    </li>
                    <li>
                      <a href="#">Gestão de comentários</a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.chatbot")}>Chatbot</a>
                    </li>
                  </ul>
                </NavItem>
                <NavItem href="#" name="+ Criar adset" />
                {/* <NavItem
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
                  href={FlowRouter.path("App.chatbot")}
                  active={currentRoute.indexOf("App.chatbot") === 0}
                >
                  Chatbot
                </NavItem> */}
              </ul>
            ) : null}
          </div>
          <div className="meta link-group">
            <SettingsNav />
            <NotificationsNav className="icon-link">
              <FontAwesomeIcon icon="bell" />
            </NotificationsNav>
          </div>
        </div>
      </Container>
    );
  }
}
