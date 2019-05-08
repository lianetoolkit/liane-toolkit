import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { find } from "lodash";

import Dropdown from "./AppNavDropdown.jsx";
import NotificationsNav from "./NotificationsPopup.jsx";

const Container = styled.nav`
  width: 100%;
  flex: 0;
  font-size: 0.8em;
  border-bottom: 1px solid #222;
  position: relative;
  z-index: 10;
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .nav-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    .features {
      flex-grow: 1;
    }
  }
  .icon-link {
    color: #fff;
    padding: 0.9rem 0.5rem 0.5rem;
    svg {
      font-size: 1.15em;
    }
    &:hover {
      color: #999;
    }
  }
`;

const NavItemContainer = styled.li`
  display: inline-block;
  position: relative;
  .icon-link {
    padding: 0.8rem 0.5rem 0;
    svg {
      font-size: 0.8em;
    }
  }
  ${props =>
    !props.clean &&
    css`
      a {
        display: block;
        padding: 0.8rem 1rem;
        text-decoration: none;
        color: #fff;
        font-weight: 600;
      }
      &:hover,
      &:active,
      &:focus {
        color: #999;
        > a {
          color: #999;
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
        background: #333;
        border-right: 1px solid #222;
        border-left: 1px solid #222;
        border-bottom: 1px solid #222;
        box-shadow: 0 0.25rem 0.3rem rgba(0, 0, 0, 0.15);
        padding: 0 0 0.5rem;
        border-radius: 0 0 7px 7px;
        li {
          display: block;
          a {
            color: #ddd;
            padding: 0.5rem 1rem;
            border: 0;
            span {
              font-size: 0.6em;
              font-style: italic;
            }
            &.disabled {
              color: #666;
            }
          }
          &:hover {
            a {
              color: #fff;
              background: #222;
              &.disabled {
                color: #666;
                background: transparent;
              }
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
    `}
  }
`;

class NavItem extends Component {
  render() {
    const { active, children, href, name, ...props } = this.props;
    let className = "";
    if (active) className += " active";
    return (
      <NavItemContainer {...props} className={className}>
        {this.props.clean ? (
          name
        ) : (
          <a href={href} {...props}>
            {name}
          </a>
        )}
        {children}
      </NavItemContainer>
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
                  name={campaign.name}
                />
                {campaigns.length > 1 ? (
                  <NavItem name={<CampaignNav campaigns={campaigns} />} clean />
                ) : null}
                <NavItem
                  href="javascript:void(0);"
                  name="Inteligência e Estratégia"
                >
                  <ul>
                    <li>
                      <a href="javascript:void(0);" className="disabled">
                        Minha audiência <span>Em breve</span>
                      </a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.map")}>Territórios</a>
                    </li>
                  </ul>
                </NavItem>
                <NavItem
                  href="javascript:void(0);"
                  name="Pessoas e Comunicação"
                >
                  <ul>
                    <li>
                      <a href={FlowRouter.path("App.people")}>
                        Diretório de pessoas
                      </a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.comments")}>
                        Gestão de comentários
                      </a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.chatbot")}>Chatbot</a>
                    </li>
                  </ul>
                </NavItem>
                <NavItem
                  href="javascript:void(0);"
                  name={
                    <>
                      <FontAwesomeIcon icon={["fab", "facebook-square"]} />{" "}
                      Criar adset
                    </>
                  }
                />
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
