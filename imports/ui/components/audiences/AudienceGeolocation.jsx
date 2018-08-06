import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
import {
  Grid,
  Sticky,
  Header,
  Card,
  Label,
  Divider,
  Table,
  Menu,
  Dimmer,
  Loader,
  Button,
  Dropdown,
  Icon
} from "semantic-ui-react";
import AudienceUtils from "./Utils.js";
import SingleLineChart from "./SingleLineChart.jsx";
import AudienceInfo from "./AudienceInfo.jsx";
import LocationChart from "./LocationChart.jsx";
import DataAlert from "./DataAlert.jsx";
import { sum, maxBy, minBy, sortBy } from "lodash";

const Wrapper = styled.div`
  .selectable td {
    cursor: pointer;
  }
  .active .category-title {
    font-weight: 600;
  }
  .ui.dropdown.icon {
    float: right;
  }
`;

export default class AudienceGeolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: {},
      sort: "name",
      geolocations: [],
      categoryListActive: true
    };
    this._handleExpand = this._handleExpand.bind(this);
  }
  componentDidMount() {
    const { audienceCategory } = this.props;
    const { sort } = this.state;
    if (audienceCategory) {
      this.setState({
        geolocations: this._doSort(audienceCategory.geolocations, sort)
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { geolocations, sort } = this.state;
    if (
      JSON.stringify(nextProps.audienceCategory.geolocations) !==
      JSON.stringify(geolocations)
    ) {
      this.setState({
        geolocations: this._doSort(
          nextProps.audienceCategory.geolocations,
          sort
        )
      });
    }
  }
  componentDidUpdate() {
    this._updateStickyMenu();
  }
  _handleSort = (ev, { value }) => {
    const { sort, geolocations } = this.state;
    if (sort !== value) {
      this.setState({
        geolocations: this._doSort(geolocations, value),
        sort: value
      });
    }
  };
  _doSort(geolocations, sort) {
    return sortBy(geolocations, item => {
      switch (sort) {
        case "name":
          return item.geolocation.name;
        case "size":
          const audience = this._latestAudience(item);
          return -(
            audience.location_estimate.dau / audience.location_total.dau
          );
        default:
          return item.geolocation.name;
      }
    });
  }
  _latestAudience(item) {
    return item.audiences[item.audiences.length - 1];
  }
  _getAverage = () => {
    const { audienceCategory } = this.props;
    let percentages = [];
    audienceCategory.geolocations.forEach(g => {
      const latestAudience = this._latestAudience(g);
      percentages.push(
        latestAudience.location_estimate.dau / latestAudience.location_total.dau
      );
    });
    return sum(percentages) / audienceCategory.geolocations.length;
  };
  _getTop = () => {
    const { audienceCategory } = this.props;
    let result = [];
    if (audienceCategory) {
      const average = this._getAverage();
      const top = sortBy(audienceCategory.geolocations, g => {
        const latestAudience = this._latestAudience(g);
        return -(
          latestAudience.location_estimate.dau /
          latestAudience.location_total.dau
        );
      }).slice(0, 3);
      top.forEach(item => {
        const latestAudience = this._latestAudience(item);
        const percentage =
          latestAudience.location_estimate.dau /
          latestAudience.location_total.dau;
        result.push({
          ...item,
          average,
          percentage: (percentage * 100).toFixed(2) + "%",
          ratio: AudienceUtils.getRatio(average, percentage)
        });
      });
    }
    return result;
  };
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
    const {
      contextRef,
      stickyRef,
      sort,
      geolocations,
      categoryListActive
    } = this.state;
    const {
      loading,
      audienceCategory,
      campaign,
      audienceCategories,
      audienceCategoryId,
      facebookAccount
    } = this.props;
    const topPlaces = this._getTop();
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
                      {audienceCategory.geolocations.length > 1 ? (
                        <>
                          <Header as="h5">
                            Places <strong>most</strong> interested in{" "}
                            {audienceCategory.category.title}
                          </Header>
                          <Grid columns={1} widths="equal">
                            <Grid.Row>
                              {topPlaces.map(item => (
                                <Grid.Column key={item.geolocation._id}>
                                  <Card className="big" fluid color="green">
                                    <Card.Content>
                                      <Card.Header>
                                        {item.geolocation.name}
                                      </Card.Header>
                                      <Card.Meta>
                                        <Label>{item.percentage}</Label>
                                      </Card.Meta>
                                      <Card.Description>
                                        {item.ratio} above average
                                      </Card.Description>
                                    </Card.Content>
                                  </Card>
                                </Grid.Column>
                              ))}
                            </Grid.Row>
                          </Grid>
                          <Divider hidden />
                        </>
                      ) : null}
                      <Dropdown
                        floating
                        labeled
                        button
                        className="icon"
                        icon="sort"
                        text="Sort"
                        value={sort}
                        onChange={this._handleSort}
                        options={[
                          {
                            key: "name",
                            value: "name",
                            text: "Name"
                          },
                          {
                            key: "size",
                            value: "size",
                            text: "Size"
                          }
                        ]}
                      />
                      <Header as="h5">All places</Header>
                      <Table selectable>
                        {geolocations.map(item => {
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
