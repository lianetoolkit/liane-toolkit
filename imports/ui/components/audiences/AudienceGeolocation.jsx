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
import SingleLineChart from "./SingleLineChart.jsx";
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
      categoryListActive: true
    };
    this._handleExpand = this._handleExpand.bind(this);
  }
  componentDidUpdate() {
    this._updateStickyMenu();
  }
  _latest() {
    const { geolocation } = this.props;
    return (audience = AudienceUtils.transformValues(
      this._latestAudience(geolocation.audienceCategories[0])
    ));
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
    const { contextRef, stickyRef, categoryListActive } = this.state;
    if (stickyRef && contextRef) {
      const stickyHeight = stickyRef.offsetHeight;
      const contentHeight = contextRef.offsetHeight;
      if (stickyHeight > contentHeight && categoryListActive) {
        this.setState({
          categoryListActive: false
        });
      } else if (stickyHeight < contentHeight && !categoryListActive) {
        this.setState({
          categoryListActive: true
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
    const { contextRef, stickyRef, categoryListActive } = this.state;
    const {
      loading,
      audienceCategory,
      campaign,
      geolocations,
      audienceCategories,
      audienceCategoryId,
      facebookAccount
    } = this.props;
    if (loading && !audienceCategory) {
      return <Loading />;
    } else {
      return (
        <Wrapper>
          <Grid columns={2} relaxed>
            <Grid.Row>
              <Grid.Column width={4}>
                <Sticky
                  active={categoryListActive}
                  offset={50}
                  context={contextRef}
                >
                  <div ref={this._handleStickyRef}>
                    <Menu pointing vertical fluid>
                      {audienceCategories.map(cat => (
                        <Menu.Item
                          key={cat._id}
                          active={cat._id == audienceCategoryId}
                          href={FlowRouter.path(
                            "App.campaignAudience.category",
                            {
                              navTab: "places",
                              campaignId: campaign._id,
                              audienceCategoryId: cat._id
                            }
                          )}
                        >
                          {cat.title}
                        </Menu.Item>
                      ))}
                    </Menu>
                  </div>
                </Sticky>
              </Grid.Column>
              <Grid.Column width={12}>
                <Sticky
                  active={!categoryListActive}
                  offset={50}
                  context={stickyRef}
                >
                  <div ref={this._handleContextRef}>
                    <Dimmer.Dimmable dimmed={loading}>
                      <Dimmer active={loading} inverted>
                        <Loader>Loading</Loader>
                      </Dimmer>
                      <Header>{audienceCategory.category.title}</Header>
                      <Table selectable>
                        {audienceCategory.geolocations.map(item => {
                          const expanded = this._isExpanded(
                            item.geolocation._id
                          );
                          return (
                            <Table.Body key={item.geolocation._id}>
                              <Table.Row
                                className="selectable"
                                active={expanded}
                                onClick={this._handleExpand(
                                  item.geolocation._id
                                )}
                              >
                                <Table.Cell collapsing>
                                  <span className="category-title">
                                    {item.geolocation.name}
                                  </span>
                                </Table.Cell>
                                <Table.Cell>
                                  {!expanded ? (
                                    <SingleLineChart
                                      audience={this._latestAudience(item)}
                                    />
                                  ) : null}
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
                                      {
                                        category: audienceCategoryId
                                      }
                                    )}
                                  >
                                    <Icon name="add" corner /> Adset
                                  </Button>
                                </Table.Cell>
                              </Table.Row>
                              {expanded ? (
                                <Table.Row active>
                                  <Table.Cell colSpan="5">
                                    <AudienceInfo
                                      data={item}
                                      single="location"
                                    />
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
