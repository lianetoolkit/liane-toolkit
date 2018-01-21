import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import styled from "styled-components";
import PropTypes from "prop-types";
import { isFbLogged } from "/imports/ui/utils/utils.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import { Menu, Accordion, Dropdown, Container, Icon } from "semantic-ui-react";

const Wrapper = styled.nav`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
`;

const MenuWrapper = styled.div`
  flex: 1 1 100%;
  overflow: auto;
`;

const AdminWrapper = styled.div`
  flex: 0 0 auto;
`;

export default class AppMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null
    };
    this._handleItemClick = this._handleItemClick.bind(this);
    this._handleAccordionClick = this._handleAccordionClick.bind(this);
  }

  _handleItemClick() {
    const { currentUser } = this.props;
    if (currentUser && isFbLogged(currentUser)) {
      FlowRouter.go("App.addCampaign");
    } else {
      Alerts.error("You need to login with facebook first");
      return;
    }
  }
  _getUserInfo(currentUser) {
    if (isFbLogged(currentUser)) {
      return currentUser.services.facebook.name;
    } else {
      return currentUser.emails[0].address;
    }
  }
  _getCampaignsMenu() {
    const { campaigns } = this.props;
    if (campaigns) {
      return (
        <Menu.Item>
          Campaigns
          <Menu.Menu>
            {campaigns.map(campaign => (
              <Menu.Item
                key={`campaign-${campaign._id}`}
                name={`campaign-${campaign._id}`}
                href={FlowRouter.path("App.campaignDetail", {
                  _id: campaign._id
                })}
              >
                {campaign.name}
              </Menu.Item>
            ))}
          </Menu.Menu>
        </Menu.Item>
      );
    } else {
      return null;
    }
  }
  _handleAccordionClick(e, titleProps) {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  }
  _getAdminMenu() {
    const { activeIndex } = this.state;
    const { currentUser } = this.props;
    if (Roles.userIsInRole(currentUser, ["admin"])) {
      return (
        <Menu.Item>
          <Accordion.Title
            active={activeIndex === 0}
            content="Administração"
            index={0}
            onClick={this._handleAccordionClick}
          />
          <Accordion.Content
            active={activeIndex === 0}
            content={
              <div>
                <Menu.Item href={FlowRouter.path("App.admin.jobs")}>
                  <Icon name="tasks" /> Backend Jobs
                </Menu.Item>
                <Menu.Item href={FlowRouter.path("App.admin.contexts")}>
                  <Icon name="circle outline" /> Contexts
                </Menu.Item>
                <Menu.Item href={FlowRouter.path("App.admin.geolocations")}>
                  <Icon name="world" /> Geolocations
                </Menu.Item>
                <Menu.Item
                  href={FlowRouter.path("App.admin.audienceCategories")}
                >
                  <Icon name="cubes" /> Audience Categories
                </Menu.Item>
              </div>
            }
          />
        </Menu.Item>
      );
    } else {
      return null;
    }
  }
  render() {
    const { activeIndex } = this.state;
    const { loading, currentUser, logout } = this.props;

    return (
      <Wrapper>
        <MenuWrapper>
          <Menu vertical inverted fluid>
            {this._getCampaignsMenu()}
            <Menu.Item name="newCampaign" onClick={this._handleItemClick}>
              <Icon name="plus" /> {i18n.__("components.userMenu.newCampaign")}
            </Menu.Item>
          </Menu>
        </MenuWrapper>
        <AdminWrapper>
          <Accordion as={Menu} vertical inverted fluid>
            {this._getAdminMenu()}
            <Menu.Item>
              <Accordion.Title
                active={activeIndex === 1}
                content={currentUser ? this._getUserInfo(currentUser) : ""}
                index={1}
                onClick={this._handleAccordionClick}
              />
              <Accordion.Content
                active={activeIndex === 1}
                content={
                  <div>
                    <Menu.Item onClick={logout}>
                      <Icon name="sign out" /> Logout
                    </Menu.Item>
                  </div>
                }
              />
            </Menu.Item>
          </Accordion>
        </AdminWrapper>
      </Wrapper>
    );
  }
}
