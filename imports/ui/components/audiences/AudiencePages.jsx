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

export default class AudiencePages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: {},
      sort: "name",
      accounts: [],
      categoryListActive: true
    };
    this._handleExpand = this._handleExpand.bind(this);
  }
  componentDidMount() {
    const { audienceCategory } = this.props;
    const { sort } = this.state;
    if (audienceCategory) {
      this.setState({
        accounts: this._doSort(audienceCategory.accounts, sort)
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { accounts, sort } = this.state;
    if (
      JSON.stringify(nextProps.audienceCategory.accounts) !==
      JSON.stringify(accounts)
    ) {
      this.setState({
        accounts: this._doSort(nextProps.audienceCategory.accounts, sort)
      });
    }
  }
  componentDidUpdate() {
    this._updateStickyMenu();
  }
  _handleSort = (ev, { value }) => {
    const { sort, accounts } = this.state;
    if (sort !== value) {
      this.setState({
        accounts: this._doSort(accounts, value),
        sort: value
      });
    }
  };
  _doSort(accounts, sort) {
    return sortBy(accounts, item => {
      switch (sort) {
        case "name":
          return item.account.name;
        case "size":
          return -AudienceUtils.getRawPercentage(this._latestAudience(item));
        default:
          return item.account.name;
      }
    });
  }
  _latestAudience(item) {
    return item.audiences[item.audiences.length - 1];
  }
  _getAverage = () => {
    const { audienceCategory } = this.props;
    let percentages = [];
    audienceCategory.accounts.forEach(g => {
      const percentage = AudienceUtils.getRawPercentage(
        this._latestAudience(g)
      );
      if (percentage) {
        percentages.push(percentage);
      }
    });
    return sum(percentages) / percentages.length;
  };
  _getHighest = () => {
    const { audienceCategory } = this.props;
    if (audienceCategory) {
      const average = this._getAverage();
      const highest = maxBy(audienceCategory.accounts, g => {
        return AudienceUtils.getRawPercentage(this._latestAudience(g));
      });
      const latestAudience = this._latestAudience(highest);
      const percentage = AudienceUtils.getRawPercentage(latestAudience);

      return {
        ...highest,
        average,
        percentage: AudienceUtils.getPercentage(latestAudience),
        ratio: AudienceUtils.getRatio(average, percentage)
      };
    }
  };
  _getLowest = () => {
    const { audienceCategory } = this.props;
    if (audienceCategory) {
      const average = this._getAverage();
      const lowest = minBy(audienceCategory.accounts, g => {
        return AudienceUtils.getRawPercentage(this._latestAudience(g)) || 100;
      });
      const percentage = AudienceUtils.getRawPercentage(
        this._latestAudience(lowest)
      );

      return {
        ...lowest,
        average,
        percentage: (percentage * 100).toFixed(2) + "%",
        ratio: AudienceUtils.getRatio(average, percentage)
      };
    }
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
      accounts,
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
    const highest = this._getHighest();
    const lowest = this._getLowest();
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
                              navTab: "pages",
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
                      <Grid columns={2} widths="equal">
                        <Grid.Row>
                          <Grid.Column>
                            <Header as="h5">
                              <strong>Most</strong> interested in{" "}
                              {audienceCategory.category.title}
                            </Header>
                            <Card className="big" fluid color="green">
                              <Card.Content>
                                <Card.Header>
                                  {highest.account.name}
                                </Card.Header>
                                <Card.Meta>
                                  <Label>{highest.percentage}</Label>
                                </Card.Meta>
                                <Card.Description>
                                  {highest.ratio} above average
                                </Card.Description>
                              </Card.Content>
                            </Card>
                          </Grid.Column>
                          <Grid.Column>
                            <Header as="h5">
                              <strong>Least</strong> interested in{" "}
                              {audienceCategory.category.title}
                            </Header>
                            <Card className="big" fluid color="red">
                              <Card.Content>
                                <Card.Header>{lowest.account.name}</Card.Header>
                                <Card.Meta>
                                  <Label>{lowest.percentage}</Label>
                                </Card.Meta>
                                <Card.Description>
                                  {lowest.ratio} below average
                                </Card.Description>
                              </Card.Content>
                            </Card>
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                      <Divider hidden />
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
                      <Header as="h5">All pages</Header>
                      <Table selectable>
                        {accounts.map(item => {
                          const expanded = this._isExpanded(
                            item.account.facebookId
                          );
                          return (
                            <Table.Body key={item.account.facebookId}>
                              <Table.Row
                                className="selectable"
                                active={expanded}
                                onClick={this._handleExpand(
                                  item.account.facebookId
                                )}
                              >
                                <Table.Cell collapsing>
                                  <span className="category-title">
                                    {item.account.name}
                                  </span>
                                </Table.Cell>
                                <Table.Cell>
                                  {!expanded ? (
                                    <SingleLineChart
                                      type="account"
                                      label="Page"
                                      color="#82ca9d"
                                      audience={this._latestAudience(item)}
                                    />
                                  ) : null}
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
                                          item.account.facebookId
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
                                  <Table.Cell colSpan="6">
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
