import React from "react";
import { lightenDarkenColor } from "/imports/ui/utils/utils.jsx";
import { Line } from "react-chartjs-2";
import _ from "underscore";

const colors = ["orange", "green", "blue", "yellow"];

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
    const lineChartData = {
      labels: labels,
      datasets: []
    };
    _.each(data, (dataSet, index) => {
      let set = {
        data: dataSet.values,
        fill: false,
        label: dataSet.title,
        lineTension: 0.4,
        borderColor: colors[index]
      };
      lineChartData.datasets.push(set);
    });

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
