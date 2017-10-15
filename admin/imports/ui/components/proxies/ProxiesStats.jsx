import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import LineChart from "/imports/ui/components/charts/LineChart.jsx";
import LoadingBlock from "/imports/ui/components/utils/LoadingBlock.jsx";

export default class ProxiesStats extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
    this.state = {
      labels: "",
      values: "",
      loading: true
    };
  }
  componentDidMount() {
    const { hours, timeOffset, proxyId } = this.props;
    Meteor.call(
      "proxyStats.getDataForChart",
      { hours, timeOffset, proxyId },
      (error, data) => {
        if (error) {
          console.log(error);
        } else {
          this.setState({
            loading: false,
            labels: data.labels,
            values: data.values
          });
        }
      }
    );
  }

  render() {
    const { values, labels, loading } = this.state;
    return (
      <div>
        {loading
          ? <LoadingBlock />
          : <LineChart
              data={values}
              labels={labels}
              name="proxy-stats"
              title="% of success"
            />}
      </div>
    );
  }
}
