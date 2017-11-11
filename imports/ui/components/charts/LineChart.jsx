import React from "react";
import { lightenDarkenColor } from "/imports/ui/utils/utils.jsx";
import { Line } from "react-chartjs-2";

export default class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this._getData = this._getData.bind(this);
    this._getChartId = this._getChartId.bind(this);
  }

  _getChartId() {
    const { name } = this.props;
    return `${name}-chart`;
  }

  _getData() {
    const { data, labels, color } = this.props;
    const baseColor = color ? color : "#EF4C4C";

    const set0 = {
      data: data,
      fill: true,
      lineTension: 0.4,
      borderColor: baseColor,
      backgroundColor: lightenDarkenColor(baseColor, 40)
    };

    const lineChartData = {
      labels: labels,
      datasets: []
    };

    lineChartData.datasets.push(set0);
    return lineChartData;
  }

  render() {
    const height = this.props.height ? this.props.height : 200;
    return (
      <div className="chart" style={{ width: "100%", height: height }}>
        <Line
          ref={this._getChartId()}
          data={this._getData()}
          legend={{ display: false }}
          options={{
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  gridLines: { display: false }
                }
              ],
              xAxes: [
                {
                  gridLines: { display: false }
                }
              ]
            }
          }}
        />
      </div>
    );
  }
}
