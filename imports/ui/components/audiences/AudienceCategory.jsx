import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import {
  Header,
  Segment,
  Statistic,
  Message,
  Divider
} from "semantic-ui-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import AudienceUtils from "./Utils.js";

export default class AudienceCategory extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      loading,
      audienceCategory,
      campaignId,
      facebookAccountId
    } = this.props;
    if (loading) {
      return <Loading />;
    } else if (audienceCategory) {
      return (
        <div>
          <p>
            <a
              href={FlowRouter.path("App.campaignAudience", {
                campaignId,
                facebookId: facebookAccountId
              })}
            >
              See all categories
            </a>
          </p>
          <Header as="h2">{audienceCategory.category.title}</Header>
          {audienceCategory.geolocations.map(item => {
            const audiences = item.audiences.map(audience =>
              AudienceUtils.transformValues(audience)
            );
            const lastAudience = audiences[item.audiences.length - 1];
            const percentage = AudienceUtils.getPercentage(lastAudience);
            return (
              <Segment key={item.geolocation._id}>
                <Header as="h3">{item.geolocation.name}</Header>
                {percentage ? (
                  <Statistic.Group widths="two" size="small">
                    <Statistic>
                      <Statistic.Value>
                        {AudienceUtils.getPercentage(lastAudience)}
                      </Statistic.Value>
                      <Statistic.Label>of your audience</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>
                        {AudienceUtils.getRatio(lastAudience)}
                      </Statistic.Value>
                      <Statistic.Label>
                        than the global in this region
                      </Statistic.Label>
                    </Statistic>
                  </Statistic.Group>
                ) : (
                  <Message warning>
                    There's not enough data for this region.
                  </Message>
                )}
                {percentage ? (
                  <div>
                    <Divider />
                    <Header as="h4">Estimate history chart</Header>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={audiences}>
                        <Line type="monotone" dataKey="estimate" />
                        {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
                        <XAxis dataKey="fetch_date" />
                        <YAxis />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
              </Segment>
            );
          })}
        </div>
      );
    } else {
      return null;
    }
  }
}
