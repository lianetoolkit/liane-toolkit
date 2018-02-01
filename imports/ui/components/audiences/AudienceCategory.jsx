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
    const { audienceCategory, campaignId, facebookAccountId } = this.props;
    if (audienceCategory) {
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
            const lastAudience = item.audiences[item.audiences.length - 1];
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
                <Divider />
                <Header as="h4">Estimate history chart</Header>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={item.audiences}>
                    <Line type="monotone" dataKey="estimate" />
                    {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
                    <XAxis dataKey="fetch_date" />
                    <YAxis />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </Segment>
            );
          })}
          {/* <Card.Group>
            {audienceCategory.map(item => (
              <Card key={item.category._id}>
                <Card.Content>
                  <Card.Header>
                    <a
                      href={FlowRouter.path("App.campaignAudience.category", {
                        campaignId,
                        facebookId: facebookAccountId,
                        categoryId: item.category._id
                      })}
                    >
                      {item.category.title}
                    </a>
                  </Card.Header>
                </Card.Content>
                {item.geolocations.map(item => (
                  <Card.Content key={item.geolocation._id}>
                    {item.geolocation.name}:{" "}
                    {item.audience ? (
                      <span>
                        <strong>
                          {AudienceUtils.getPercentage(item.audience)}{" "}
                        </strong>
                        <Label size="small">
                          {AudienceUtils.getRatio(item.audience)}
                        </Label>
                      </span>
                    ) : (
                      "Data not found"
                    )}
                  </Card.Content>
                ))}
              </Card>
            ))}
          </Card.Group> */}
        </div>
      );
    } else {
      return null;
    }
  }
}
