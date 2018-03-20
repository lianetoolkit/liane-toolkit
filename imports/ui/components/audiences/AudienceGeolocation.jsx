import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
import { Grid, Sticky, Header, Divider, Table, Menu } from "semantic-ui-react";
import AudienceUtils from "./Utils.js";
import CompareLine from "./CompareLine.jsx";
import AudienceInfo from "./AudienceInfo.jsx";

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
      expanded: {}
    };
    this._handleExpand = this._handleExpand.bind(this);
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
  render() {
    const { contextRef } = this.state;
    const {
      loading,
      geolocation,
      campaign,
      geolocations,
      facebookAccount
    } = this.props;
    if (loading) {
      return <Loading />;
    } else {
      return (
        <Wrapper>
          <Header as="h2">Geolocation Details</Header>
          <Divider hidden />
          <Grid columns={2} relaxed>
            <Grid.Row>
              <Grid.Column width={4}>
                <Sticky
                  offset={20}
                  context={contextRef}
                  scrollContext={document.getElementById("app-content")}
                >
                  <Menu pointing vertical fluid>
                    {geolocation.mainGeolocation ? (
                      <Menu.Item
                        active={
                          geolocation.mainGeolocation._id ==
                          geolocation.geolocation._id
                        }
                        href={FlowRouter.path(
                          "App.campaignAudience.geolocation",
                          {
                            campaignId: campaign._id,
                            facebookId: facebookAccount.facebookId,
                            geolocationId: geolocation.mainGeolocation._id
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
                            active={gl._id == geolocation.geolocation._id}
                            href={FlowRouter.path(
                              "App.campaignAudience.geolocation",
                              {
                                campaignId: campaign._id,
                                facebookId: facebookAccount.facebookId,
                                geolocationId: gl._id
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
                </Sticky>
              </Grid.Column>
              <Grid.Column width={12} ref={this._handleContextRef}>
                <Header>{this._getTotal()} daily active users</Header>
                {geolocation.mainGeolocation &&
                geolocation.geolocation._id !==
                  geolocation.mainGeolocation._id ? (
                  <p>
                    {this._getPercentage()} of{" "}
                    {geolocation.mainGeolocation.name} estimate
                  </p>
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
                            {/* <a
                              className="category-title"
                              href={FlowRouter.path(
                                "App.campaignAudience.category",
                                {
                                  campaignId: campaign._id,
                                  facebookId: facebookAccount.facebookId,
                                  categoryId: item.category._id
                                }
                              )}
                            > */}
                            <span className="category-title">
                              {item.category.title}
                            </span>
                            {/* </a> */}
                          </Table.Cell>
                          <Table.Cell>
                            {!expanded ? (
                              <CompareLine
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
                        </Table.Row>
                        {expanded ? (
                          <Table.Row active>
                            <Table.Cell colSpan="3">
                              <AudienceInfo data={item} />
                            </Table.Cell>
                          </Table.Row>
                        ) : null}
                      </Table.Body>
                    );
                  })}
                </Table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Wrapper>
      );
    }
  }
}
