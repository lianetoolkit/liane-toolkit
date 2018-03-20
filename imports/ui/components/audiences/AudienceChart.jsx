import React from "react";
import moment from "moment";
import styled from "styled-components";
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
  background: rgba(255, 255, 255, 0.5);
  padding: 0.5rem;
  p {
    margin: 0;
  }
  .percentage {
    color: #82ca9d;
  }
  .location_percentage {
    color: #8884d8;
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
        {payload.map(item => (
          <div key={item.dataKey} className={item.dataKey}>
            {item.dataKey == "percentage" ? (
              <p>
                <strong>Your page:</strong> {item.value.toFixed(2) + "%"} ({
                  data.estimate
                })
              </p>
            ) : null}
            {item.dataKey == "location_percentage" ? (
              <p>
                <strong>Location:</strong> {item.value.toFixed(2) + "%"} ({
                  data.location_estimate
                })
              </p>
            ) : null}
          </div>
        ))}
      </TooltipWrapper>
    );
  } else {
    return null;
  }
};

export default class AudienceChart extends React.Component {
  constructor(props) {
    super(props);
  }
  populatePercentages(data) {
    return data.map(item => {
      item.percentage = item.estimate / item.total * 100;
      item.location_percentage =
        item.location_estimate / item.location_total * 100;
      return item;
    });
  }
  render() {
    let audiences = this.props.audiences.map(audience =>
      AudienceUtils.transformValues(audience)
    );
    audiences = this.populatePercentages(audiences);
    const lastAudience = audiences[audiences.length - 1];
    const percentage = AudienceUtils.getPercentage(lastAudience);
    return (
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={audiences}>
          {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
          <XAxis hide dataKey="fetch_date" />
          <YAxis yAxisId="left" domain={["auto", "auto"]} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={["auto", "auto"]}
          />
          <Tooltip content={<AudienceTooltip />} />
          {percentage ? (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="percentage"
              stroke="#82ca9d"
            />
          ) : null}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="location_percentage"
            stroke="#8884d8"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
