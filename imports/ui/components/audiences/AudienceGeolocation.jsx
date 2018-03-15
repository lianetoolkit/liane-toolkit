import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Grid, Sticky, Header, Divider, Table, Menu } from "semantic-ui-react";
import AudienceUtils from "./Utils.js";
import CompareLine from "./CompareLine.jsx";

export default class AudienceGeolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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
    return item.audiences[0];
  }
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
        <div>
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
                  <Menu pointing vertical>
                    {geolocations.map(gl => (
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
                    ))}
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
                <Table>
                  <Table.Body>
                    {geolocation.audienceCategories.map(item => (
                      <Table.Row key={item.category._id}>
                        <Table.Cell collapsing>
                          <a
                            href={FlowRouter.path(
                              "App.campaignAudience.category",
                              {
                                campaignId: campaign._id,
                                facebookId: facebookAccount.facebookId,
                                categoryId: item.category._id
                              }
                            )}
                          >
                            {item.category.title}
                          </a>
                        </Table.Cell>
                        <Table.Cell>
                          <CompareLine audience={this._latestAudience(item)} />
                        </Table.Cell>
                        <Table.Cell>
                          <strong>
                            {AudienceUtils.getRatio(this._latestAudience(item))}
                          </strong>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}
