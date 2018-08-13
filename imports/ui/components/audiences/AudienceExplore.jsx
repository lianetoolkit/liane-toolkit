import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
import {
  Grid,
  Sticky,
  Header,
  Divider,
  Table,
  Menu,
  Dimmer,
  Loader,
  Button,
  Icon
} from "semantic-ui-react";
import AudienceUtils from "./Utils.js";
import CompareLineChart from "./CompareLineChart.jsx";
import AudienceInfo from "./AudienceInfo.jsx";
import LocationChart from "./LocationChart.jsx";
import DataAlert from "./DataAlert.jsx";

const Wrapper = styled.div`
  .selectable td {
    cursor: pointer;
  }
  .active .category-title {
    font-weight: 600;
  }
`;

export default class AudienceGeolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: {},
      geolocationListActive: true
    };
    this._handleExpand = this._handleExpand.bind(this);
  }
  componentDidUpdate() {
    this._updateStickyMenu();
  }
  _latest() {
    const { geolocation } = this.props;
    return AudienceUtils.transformValues(
      this._latestAudience(geolocation.audienceCategories[0])
    );
  }
  _getPercentage() {
    const { facebookAccount, geolocation } = this.props;
    const audience = this._latest();
    let total = facebookAccount.fanCount;
    if (geolocation.mainGeolocation) {
      total = AudienceUtils.getValue(
        geolocation.mainGeolocation.audience.estimate
      );
    }
    let cent = Math.min(audience.total / total, 0.99);
    return (cent * 100).toFixed(2) + "%";
  }
  _getTotal() {
    const audience = this._latest();
    return audience.total;
  }
  _latestAudience(item) {
    return item.audiences[item.audiences.length - 1];
  }
  _updateStickyMenu() {
    const { contextRef, stickyRef, geolocationListActive } = this.state;
    if (stickyRef && contextRef) {
      const stickyHeight = stickyRef.offsetHeight;
      const contentHeight = contextRef.offsetHeight;
      if (stickyHeight > contentHeight && geolocationListActive) {
        this.setState({
          geolocationListActive: false
        });
      } else if (stickyHeight < contentHeight && !geolocationListActive) {
        this.setState({
          geolocationListActive: true
        });
      }
    }
  }
  _handleExpand = categoryId => ev => {
    const { expanded } = this.state;
    if (!expanded[categoryId]) {
      this.setState({
        expanded: {
          ...expanded,
          [categoryId]: true
        }
      });
    } else {
      this.setState({
        expanded: {
          ...expanded,
          [categoryId]: false
        }
      });
    }
  };
  _isExpanded = categoryId => {
    return this.state.expanded[categoryId];
  };
  _handleContextRef = contextRef => this.setState({ contextRef });
  _handleStickyRef = stickyRef => this.setState({ stickyRef });
  render() {
    const { contextRef, stickyRef, geolocationListActive } = this.state;
    const {
      loading,
      geolocation,
      campaign,
      geolocations,
      facebookAccount,
      geolocationId
    } = this.props;
    if (loading && !geolocation) {
      return <Loading />;
    } else {
      return (
        <Wrapper>
          <Grid columns={2} relaxed>
            <Grid.Row>
              <Grid.Column width={4}>
                <Sticky
                  active={geolocationListActive}
                  offset={50}
                  context={contextRef}
                  // scrollContext={document.getElementById("app-content")}
                >
                  <div ref={this._handleStickyRef}>
                    <Menu pointing vertical fluid>
                      {geolocation.mainGeolocation ? (
                        <Menu.Item
                          active={
                            geolocation.mainGeolocation._id == geolocationId
                          }
                          href={FlowRouter.path(
                            "App.campaignAudience.geolocation",
                            {
                              navTab: "explore",
                              campaignId: campaign._id,
                              geolocationId: geolocation.mainGeolocation._id
                            },
                            {
                              account: facebookAccount.facebookId
                            }
                          )}
                        >
                          {geolocation.mainGeolocation.name}
                        </Menu.Item>
                      ) : null}
                      {geolocations.map(gl => {
                        if (
                          !geolocation.mainGeolocation ||
                          gl._id !== geolocation.mainGeolocation._id
                        ) {
                          return (
                            <Menu.Item
                              key={gl._id}
                              active={gl._id == geolocationId}
                              href={FlowRouter.path(
                                "App.campaignAudience.geolocation",
                                {
                                  navTab: "explore",
                                  campaignId: campaign._id,
                                  geolocationId: gl._id
                                },
                                {
                                  account: facebookAccount.facebookId
                                }
                              )}
                            >
                              {gl.name}
                            </Menu.Item>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </Menu>
                  </div>
                </Sticky>
              </Grid.Column>
              <Grid.Column width={12}>
                <Sticky
                  active={!geolocationListActive}
                  offset={50}
                  context={stickyRef}
                  // scrollContext={document.getElementById("app-content")}
                >
                  <div ref={this._handleContextRef}>
                    <Dimmer.Dimmable dimmed={loading}>
                      <Dimmer active={loading} inverted>
                        <Loader>Loading</Loader>
                      </Dimmer>
                      <Header>
                        Today's estimate: {this._getTotal()} active users
                      </Header>
                      {geolocation.mainGeolocation &&
                      geolocation.geolocation._id !==
                        geolocation.mainGeolocation._id ? (
                        <p>
                          {this._getPercentage()} of{" "}
                          {geolocation.mainGeolocation.name} estimate
                        </p>
                      ) : (
                        <p />
                      )}
                      {geolocation.audienceCategories[0] &&
                      geolocation.audienceCategories[0].audiences &&
                      geolocation.audienceCategories[0].audiences.length > 1 ? (
                        <LocationChart
                          audiences={
                            geolocation.audienceCategories[0].audiences
                          }
                        />
                      ) : null}
                      <Table selectable>
                        {geolocation.audienceCategories.map(item => {
                          const expanded = this._isExpanded(item.category._id);
                          return (
                            <Table.Body key={item.category._id}>
                              <Table.Row
                                className="selectable"
                                active={expanded}
                                onClick={this._handleExpand(item.category._id)}
                              >
                                <Table.Cell collapsing>
                                  <span className="category-title">
                                    {item.category.title}
                                  </span>
                                </Table.Cell>
                                <Table.Cell>
                                  {!expanded ? (
                                    <CompareLineChart
                                      audience={this._latestAudience(item)}
                                    />
                                  ) : null}
                                </Table.Cell>
                                <Table.Cell collapsing>
                                  <strong>
                                    {AudienceUtils.getRatio(
                                      this._latestAudience(item)
                                    )}
                                  </strong>
                                </Table.Cell>
                                <Table.Cell collapsing>
                                  <DataAlert
                                    audience={this._latestAudience(item)}
                                  />
                                </Table.Cell>
                                <Table.Cell collapsing>
                                  <Button
                                    size="tiny"
                                    basic
                                    icon
                                    href={FlowRouter.path(
                                      "App.campaignAds.create",
                                      {
                                        campaignId: campaign._id,
                                        audienceFacebookId:
                                          facebookAccount.facebookId
                                      },
                                      { category: item.category._id }
                                    )}
                                  >
                                    <Icon name="add" corner /> Adset
                                  </Button>
                                </Table.Cell>
                              </Table.Row>
                              {expanded ? (
                                <Table.Row active>
                                  <Table.Cell colSpan="5">
                                    <AudienceInfo data={item} />
                                  </Table.Cell>
                                </Table.Row>
                              ) : null}
                            </Table.Body>
                          );
                        })}
                      </Table>
                    </Dimmer.Dimmable>
                  </div>
                </Sticky>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Wrapper>
      );
    }
  }
}
