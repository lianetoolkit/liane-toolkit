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
                <strong>
                  Page: {item.value.toFixed(2) + "%"} ({data.estimate})
                </strong>
              </p>
            ) : null}
            {item.dataKey == "location_percentage" ? (
              <p>
                <strong>Global:</strong> {item.value.toFixed(2) + "%"} ({
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
    this.state = {};
  }
  componentWillReceiveProps() {}
  componentDidUpdate() {
    this._updateWidth();
  }
  _handleRef = ref => this.setState({ ref });
  _updateWidth() {
    const { width, ref } = this.state;
    if (ref) {
      const newWidth = ref.offsetWidth;
      if (newWidth != width) {
        this.setState({ width: newWidth });
      }
    }
  }
  populatePercentages(data) {
    return data.map(item => {
      item.percentage = (item.estimate / item.total) * 100;
      item.location_percentage =
        (item.location_estimate / item.location_total) * 100;
      return item;
    });
  }
  render() {
    const { single } = this.props;
    const { width } = this.state;
    let audiences = this.props.audiences.map(audience =>
      AudienceUtils.transformValues(audience)
    );
    audiences = this.populatePercentages(audiences);
    const lastAudience = audiences[audiences.length - 1];
    const percentage = AudienceUtils.getPercentage(lastAudience);
    return (
      <div style={{ width, height: "100px" }} ref={this._handleRef}>
        <ResponsiveContainer>
          <LineChart data={audiences}>
            {/* <CartesianGrid stroke="#ccc" strokeDasharray="5 5" /> */}
            <XAxis hide dataKey="fetch_date" />
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[
                dataMin => Math.floor(dataMin) - 3,
                dataMax => Math.ceil(dataMax) + 3
              ]}
              tickFormatter={tick => tick + "%"}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[
                dataMin => Math.floor(dataMin) - 3,
                dataMax => Math.ceil(dataMax) + 3
              ]}
              tickFormatter={tick => tick + "%"}
            />
            <Tooltip content={<AudienceTooltip />} />
            {percentage && (!single || single !== "location") ? (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentage"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            ) : null}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="location_percentage"
              stroke="#8884d8"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
