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
  .total {
    color: #82ca9d;
  }
`;

const LocationTooltip = ({ type, payload, label }) => {
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
            <p>
              <strong>Total: {item.value}</strong>
            </p>
          </div>
        ))}
      </TooltipWrapper>
    );
  } else {
    return null;
  }
};

export default class LocationChart extends React.Component {
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
    console.log(audiences);
    audiences = this.populatePercentages(audiences);
    return (
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={audiences}>
          {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
          <XAxis hide dataKey="fetch_date" />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={["auto", "auto"]}
          />
          <Tooltip content={<LocationTooltip />} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total"
            stroke="#82ca9d"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
