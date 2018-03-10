import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import styled from "styled-components";
import PropTypes from "prop-types";
import { isFbLogged } from "/imports/ui/utils/utils.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import {
  Header,
  Menu,
  Message,
  Accordion,
  Dropdown,
  Container,
  Icon
} from "semantic-ui-react";

const Wrapper = styled.nav`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  h2 {
    margin: 0;
  }
  .campaigns-menu.ui.accordion.menu .item .title > .dropdown.icon {
    margin-top: 0.75em;
  }
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
      activeIndex: -1,
      showCampaignList: false
    };
    this._handleItemClick = this._handleItemClick.bind(this);
    this._handleAccordionClick = this._handleAccordionClick.bind(this);
    this._toggleCampaignList = this._toggleCampaignList.bind(this);
  }
  componentWillReceiveProps() {
    const { showCampaignList } = this.state;
    if (showCampaignList) {
      this.setState({
        showCampaignList: false
      });
    }
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
  _handleAccordionClick(e, titleProps) {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  }
  _toggleCampaignList() {
    this.setState({
      showCampaignList: !this.state.showCampaignList
    });
  }
  _getCurrentCampaign() {
    const { campaigns, currentCampaign } = this.props;
    if (campaigns && currentCampaign) {
      return campaigns.find(c => c._id == currentCampaign);
    }
    return false;
  }
  _getUserInfo(currentUser) {
    if (isFbLogged(currentUser)) {
      return currentUser.services.facebook.name;
    } else if (currentUser.emails) {
      return currentUser.emails[0].address;
    } else {
      return "";
    }
  }
  _getCampaignsMenu() {
    const { activeIndex, showCampaignList } = this.state;
    const { campaigns } = this.props;
    const currentCampaign = this._getCurrentCampaign();
    if (campaigns && campaigns.length) {
      return (
        <Accordion as={Menu} vertical inverted fluid className="campaigns-menu">
          <Menu.Item>
            <Accordion.Title
              active={currentCampaign ? showCampaignList : true}
              content={
                currentCampaign ? <h2>{currentCampaign.name}</h2> : "Campaigns"
              }
              onClick={this._toggleCampaignList}
            />
            <Accordion.Content
              active={currentCampaign ? showCampaignList : true}
              content={
                <div>
                  {campaigns.map(campaign => {
                    if (campaign._id !== currentCampaign._id) {
                      return (
                        <Menu.Item
                          key={`campaign-${campaign._id}`}
                          name={`campaign-${campaign._id}`}
                          href={FlowRouter.path("App.campaignDetail", {
                            campaignId: campaign._id
                          })}
                        >
                          {campaign.name}
                        </Menu.Item>
                      );
                    } else {
                      return null;
                    }
                  })}
                </div>
              }
            />
          </Menu.Item>
        </Accordion>
      );
    } else {
      return null;
    }
  }
  _getAdminMenu() {
    const { activeIndex } = this.state;
    const { currentUser } = this.props;
    if (Roles.userIsInRole(currentUser, ["admin"])) {
      return (
        <Menu.Item>
          <Accordion.Title
            active={activeIndex === 1}
            content="Administration"
            index={1}
            onClick={this._handleAccordionClick}
          />
          <Accordion.Content
            active={activeIndex === 1}
            content={
              <div>
                <Menu.Item href={FlowRouter.path("App.admin.campaigns")}>
                  <Icon name="announcement" /> Campaigns
                </Menu.Item>
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
    const { activeIndex, showCampaignList } = this.state;
    const { loading, currentUser, logout } = this.props;

    const currentCampaign = this._getCurrentCampaign();

    const currentRoute = FlowRouter.current().route.name;

    return (
      <Wrapper>
        <MenuWrapper>
          {this._getCampaignsMenu()}
          {currentCampaign && !showCampaignList && activeIndex == -1 ? (
            <div>
              {currentCampaign.status == "invalid_adaccount" ? (
                <Message negative>
                  Your campaign has an invalid ad account.{" "}
                  <a
                    href={FlowRouter.path("App.campaignSettings", {
                      campaignId: currentCampaign._id
                    })}
                  >
                    Edit your settings
                  </a>.
                </Message>
              ) : null}
              <Menu vertical inverted fluid>
                {/* <Menu.Item>
                  <Icon name="alarm" /> Actions
                </Menu.Item> */}
                <Menu.Item
                  name="campaignPeople"
                  active={currentRoute.indexOf("App.campaignCanvas") === 0}
                  href={FlowRouter.path("App.campaignCanvas", {
                    campaignId: currentCampaign._id
                  })}
                >
                  <Icon name="options" /> Canvas
                </Menu.Item>
                <Menu.Item
                  name="campaignPeople"
                  active={currentRoute.indexOf("App.campaignPeople") === 0}
                  href={FlowRouter.path("App.campaignPeople", {
                    campaignId: currentCampaign._id
                  })}
                >
                  <Icon name="address book" /> People
                </Menu.Item>
                <Menu.Item
                  name="campaignAudience"
                  active={currentRoute.indexOf("App.campaignAudience") === 0}
                  href={FlowRouter.path("App.campaignAudience", {
                    campaignId: currentCampaign._id
                  })}
                >
                  <Icon name="star" /> Audience
                </Menu.Item>
                {/* <Menu.Item
                  name="campaignEntries"
                  active={currentRoute.indexOf("App.campaignEntries") === 0}
                  href={FlowRouter.path("App.campaignEntries", {
                    campaignId: currentCampaign._id
                  })}
                >
                  <Icon name="comments" /> Facebook Posts
                </Menu.Item> */}
                <Menu.Item
                  name="campaignSettings"
                  active={currentRoute.indexOf("App.campaignSettings") === 0}
                  href={FlowRouter.path("App.campaignSettings", {
                    campaignId: currentCampaign._id
                  })}
                >
                  <Icon name="settings" /> Settings
                </Menu.Item>
                {/* <Menu.Item
                  name="campaignEntries"
                  active={currentRoute.indexOf("App.campaignLists") === 0}
                  href={FlowRouter.path("App.campaignLists", {
                    campaignId: currentCampaign._id
                  })}
                >
                  <Icon name="spy" /> Monitoring Lists
                </Menu.Item> */}
              </Menu>
            </div>
          ) : null}
        </MenuWrapper>
        <AdminWrapper>
          <Menu vertical inverted fluid>
            <Menu.Item name="newCampaign" onClick={this._handleItemClick}>
              <Icon name="plus" /> {i18n.__("components.userMenu.newCampaign")}
            </Menu.Item>
          </Menu>
          <Accordion as={Menu} vertical inverted fluid>
            {this._getAdminMenu()}
            <Menu.Item>
              <Accordion.Title
                active={activeIndex === 2}
                content={currentUser ? this._getUserInfo(currentUser) : ""}
                index={2}
                onClick={this._handleAccordionClick}
              />
              <Accordion.Content
                active={activeIndex === 2}
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
