import React from "react";
import { Divider } from "semantic-ui-react";
import CompareLineChart from "./CompareLineChart.jsx";
import SingleLineChart from "./SingleLineChart.jsx";
import AudienceChart from "./AudienceChart.jsx";

export default class AudienceInfo extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { single, data } = this.props;
    return (
      <div>
        {single && single == "location" ? (
          <SingleLineChart
            audience={data.audiences[data.audiences.length - 1]}
          />
        ) : (
          <CompareLineChart
            audience={data.audiences[data.audiences.length - 1]}
          />
        )}
        <Divider hidden />
        <AudienceChart audiences={data.audiences} single={single} />
      </div>
    );
  }
}
