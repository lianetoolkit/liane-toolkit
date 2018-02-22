import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Card, Statistic, Header, Label } from "semantic-ui-react";
import AudienceUtils from "./Utils.js";

export default class AudienceGeolocationSummary extends React.Component {
  _getPercentage(estimate) {
    const { summary } = this.props;
    const total = summary.facebookAccount.fanCount;
    let dif = Math.min(estimate / total, 0.99);
    return (dif * 100).toFixed(2) + "%";
  }
  render() {
    const { loading, summary } = this.props;
    if (loading) {
      return <Loading />;
    } else {
      return (
        <Card.Group>
          {summary.data.map(item => (
            <Card key={item.geolocation._id}>
              <Card.Content>
                <Card.Header>{item.geolocation.name}</Card.Header>
              </Card.Content>
              <Card.Content textAlign="center">
                <Statistic size="small">
                  <Statistic.Value>
                    {this._getPercentage(item.audience.estimate)}
                  </Statistic.Value>
                  <Statistic.Label>of your total audience</Statistic.Label>
                </Statistic>
              </Card.Content>
            </Card>
          ))}
        </Card.Group>
      );
      return <p>Teste</p>;
    }
  }
}
