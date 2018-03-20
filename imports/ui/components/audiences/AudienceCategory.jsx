import moment from "moment";
import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
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

const TooltipWrapper = styled.div`
  background: rgba(255,255,255,0.5);
  padding: .5rem;
  p {
    margin: 0;
  }
`;

const AudienceTooltip = ({ type, payload, label }) => {
  let data;
  if (payload.length) {
    data = payload[0].payload;
  }
  if (data) {
    return (
      <TooltipWrapper className="audience-tooltip">
        <p>
          <strong>{moment(label).format("LL")}</strong>
        </p>
        <p>
          {data.percentage.toFixed(2) + "%"} ({data.estimate})
        </p>
      </TooltipWrapper>
    );
  } else {
    return null;
  }
};

export default class AudienceCategory extends React.Component {
  constructor(props) {
    super(props);
  }
  populatePercentages(data) {
    return data.map(item => {
      item.percentage = item.estimate / item.total * 100;
      return item;
    });
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
          <Segment.Group>
            {audienceCategory.geolocations.map(item => {
              let audiences = item.audiences.map(audience =>
                AudienceUtils.transformValues(audience)
              );
              audiences = this.populatePercentages(audiences);
              const lastAudience = audiences[item.audiences.length - 1];
              const percentage = AudienceUtils.getPercentage(lastAudience);
              return (
                <Segment key={item.geolocation._id}>
                  <Header as="h3">{item.geolocation.name}</Header>
                  {percentage ? (
                    <div>
                      <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={audiences}>
                          <Line type="monotone" dataKey="percentage" />
                          {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
                          <XAxis hide dataKey="fetch_date" />
                          <YAxis domain={["auto", "auto"]} />
                          <Tooltip content={<AudienceTooltip />} />
                        </LineChart>
                      </ResponsiveContainer>
                      <Divider hidden />
                    </div>
                  ) : null}
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
                </Segment>
              );
            })}
          </Segment.Group>
        </div>
      );
    } else {
      return null;
    }
  }
}
