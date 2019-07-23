import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { find } from "lodash";

import Dropdown from "./AppNavDropdown.jsx";
import NotificationsNav from "./NotificationsPopup.jsx";

const messages = defineMessages({
  intelligenceStrategy: {
    id: "app.nav.intelligence_strategy",
    defaultMessage: "Intelligence and Strategy"
  },
  peopleCommunication: {
    id: "app.nav.people_communication",
    defaultMessage: "People and Communication"
  },
  electoralCanvas: {
    id: "app.nav.electoral_canvas",
    defaultMessage: "Electoral Canvas"
  }
});

const Container = styled.nav`
  width: 100%;
  flex: 0;
  font-size: 0.8em;
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
            span.info {
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
    window.location.reload();
  };
  render() {
    const { campaign } = this.props;
    const user = Meteor.user();
    return (
      <Dropdown
        width="200px"
        height="auto"
        className="icon-link"
        trigger={<FontAwesomeIcon icon="cog" />}
      >
        <Dropdown.Content>
          {campaign ? (
            <>
              <Dropdown.NavItem href={FlowRouter.path("App.campaign.settings")}>
                <FormattedMessage
                  id="app.nav.campaign_settings"
                  defaultMessage="Campaign settings"
                />
              </Dropdown.NavItem>
              <Dropdown.Separator />
            </>
          ) : null}
          {user.type == "campaigner" ? (
            <>
              <Dropdown.NavItem href={FlowRouter.path("App.campaign.new")}>
                <FormattedMessage
                  id="app.nav.campaign_new"
                  defaultMessage="New campaign"
                />
              </Dropdown.NavItem>
              <Dropdown.Separator />
            </>
          ) : null}
          <Dropdown.NavItem href={FlowRouter.path("App.account")}>
            <FormattedMessage id="app.my_account" defaultMessage="My account" />
          </Dropdown.NavItem>
          <Dropdown.NavItem href="javascript:void(0);" onClick={this._logout()}>
            <FormattedMessage id="app.logout" defaultMessage="Logout" />
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
    window.location.reload();
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

class AppNav extends Component {
  render() {
    const { intl, campaigns, campaign, notifications } = this.props;
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
                  href={FlowRouter.path("App.map")}
                  name={intl.formatMessage(messages.intelligenceStrategy)}
                >
                  <ul>
                    <li>
                      <a href="javascript:void(0);" className="disabled">
                        <FormattedMessage
                          id="app.nav.my_audience"
                          defaultMessage="My audience"
                        />{" "}
                        <span className="info">
                          (
                          <FormattedMessage
                            id="app.soon"
                            defaultMessage="soon"
                          />
                          )
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.map")}>
                        <FormattedMessage
                          id="app.nav.territories"
                          defaultMessage="Territories"
                        />
                      </a>
                    </li>
                  </ul>
                </NavItem>
                <NavItem
                  href={FlowRouter.path("App.people")}
                  name={intl.formatMessage(messages.peopleCommunication)}
                >
                  <ul>
                    <li>
                      <a href={FlowRouter.path("App.people")}>
                        <FormattedMessage
                          id="app.nav.people_directory"
                          defaultMessage="People directory"
                        />
                      </a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.comments")}>
                        <FormattedMessage
                          id="app.nav.manage_comments"
                          defaultMessage="Manage comments"
                        />
                      </a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.chatbot")}>Chatbot</a>
                    </li>
                    <li>
                      <a href={FlowRouter.path("App.faq")}>
                        <FormattedMessage
                          id="app.nav.faq"
                          defaultMessage="Frequently asked questions"
                        />
                      </a>
                    </li>
                  </ul>
                </NavItem>
                <NavItem
                  href="https://canvas.liane.cc"
                  target="_blank"
                  rel="external"
                  name={intl.formatMessage(messages.electoralCanvas)}
                />
              </ul>
            ) : null}
          </div>
          <div className="meta link-group">
            <SettingsNav campaign={campaign} />
            <NotificationsNav
              className="icon-link"
              notifications={notifications}
            >
              <FontAwesomeIcon icon="bell" />
            </NotificationsNav>
          </div>
        </div>
      </Container>
    );
  }
}

AppNav.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(AppNav);
