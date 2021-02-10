import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { find } from "lodash";

import { userCan } from "/imports/ui2/utils/permissions";

import Dropdown from "./AppNavDropdown.jsx";
import NotificationsNav from "./NotificationsPopup.jsx";

const messages = defineMessages({
  intelligenceStrategy: {
    id: "app.nav.intelligence_strategy",
    defaultMessage: "Intelligence and Strategy",
  },
  peopleCommunication: {
    id: "app.nav.people_communication",
    defaultMessage: "People and Communication",
  },
  electoralCanvas: {
    id: "app.nav.electoral_canvas",
    defaultMessage: "Electoral Canvas",
  },
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
    align-items: flex-end;
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
      color: rgba(255, 255, 255, 0.5);
    }
  }
  .meta.link-group {
    margin-top: 0.4rem;
    margin-bottom: -1px;
    border-radius: 7px 7px 0 0;
    background: #482075;
    padding: 0 0.2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
    .icon-link {
      padding-top: 0.5rem;
    }
    .dropdown {
      top: 31px;
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
  ${(props) =>
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
        color: rgba(255, 255, 255, 0.5);
        > a {
          color: rgba(255, 255, 255, 0.5);
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
        background: #330066;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0.25rem 0.3rem rgba(0, 0, 0, 0.15);
        padding: 0 0 0.5rem;
        border-radius: 0 0 7px 7px;
        li {
          display: block;
          a {
            color: rgba(255, 255, 255, 0.75);
            padding: 0.5rem 1rem;
            border: 0;
            line-height: 1.3;
            span.info {
              font-size: 0.6em;
              font-style: italic;
            }
            &.disabled {
              color: rgba(255, 255, 255, 0.5);
            }
          }
          &:hover {
            a {
              color: #fff;
              background: #111;
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
  _logout = () => (ev) => {
    ev.preventDefault();
    Meteor.logout();
    window.location.reload();
  };
  _isAdmin = () => {
    const user = Meteor.user();
    return (
      user &&
      user.roles &&
      Array.isArray(user.roles) &&
      user.roles.indexOf("admin") != -1
    );
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
          {campaign && userCan("admin") ? (
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
          <Dropdown.NavItem href={FlowRouter.path("App.campaign.new")}>
            <FormattedMessage
              id="app.nav.campaign_new"
              defaultMessage="New campaign"
            />
          </Dropdown.NavItem>
          <Dropdown.Separator />
          <Dropdown.NavItem href={FlowRouter.path("App.account")}>
            <FormattedMessage id="app.my_account" defaultMessage="My account" />
          </Dropdown.NavItem>
          {this._isAdmin() ? (
            <Dropdown.NavItem href={FlowRouter.path("App.admin")}>
              <FormattedMessage
                id="app.admin_label"
                defaultMessage="Administration"
              />
            </Dropdown.NavItem>
          ) : null}
          <Dropdown.NavItem href="javascript:void(0);" onClick={this._logout()}>
            <FormattedMessage id="app.logout" defaultMessage="Logout" />
          </Dropdown.NavItem>
        </Dropdown.Content>
      </Dropdown>
    );
  }
}

class CampaignNav extends Component {
  _handleClick = (campaignId) => (ev) => {
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
          {campaigns.map((campaign) => (
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
                {userCan("view", "map") ? (
                  <NavItem
                    href={FlowRouter.path("App.map")}
                    name={intl.formatMessage(messages.intelligenceStrategy)}
                  >
                    <ul>
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
                ) : null}
                {userCan("view", "people", "comments", "faq", "form") ? (
                  <NavItem
                    href="javascript:void(0);"
                    name={intl.formatMessage(messages.peopleCommunication)}
                  >
                    <ul>
                      {userCan("view", "people") ? (
                        <li>
                          <a href={FlowRouter.path("App.people")}>
                            <FormattedMessage
                              id="app.nav.people_directory"
                              defaultMessage="People directory"
                            />
                          </a>
                        </li>
                      ) : null}
                      {userCan("view", "comments") ? (
                        <li>
                          <a href={FlowRouter.path("App.comments")}>
                            <FormattedMessage
                              id="app.nav.manage_comments"
                              defaultMessage="Manage comments"
                            />
                          </a>
                        </li>
                      ) : null}
                      {userCan("view", "faq") ? (
                        <li>
                          <a href={FlowRouter.path("App.faq")}>
                            <FormattedMessage
                              id="app.nav.faq"
                              defaultMessage="Frequently asked questions"
                            />
                          </a>
                        </li>
                      ) : null}
                      {userCan("edit", "form") ? (
                        <li>
                          <a href={FlowRouter.path("App.formSettings")}>
                            <FormattedMessage
                              id="app.nav.form"
                              defaultMessage="Form"
                            />
                          </a>
                        </li>
                      ) : null}
                    </ul>
                  </NavItem>
                ) : null}
                {/* <NavItem
                  href="https://canvas.liane.cc"
                  target="_blank"
                  rel="external"
                  name={intl.formatMessage(messages.electoralCanvas)}
                /> */}
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
  intl: intlShape.isRequired,
};

export default injectIntl(AppNav);
