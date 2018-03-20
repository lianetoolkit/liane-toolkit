import React from "react";
import { Divider } from "semantic-ui-react";
import CompareLine from "./CompareLine.jsx";
import AudienceChart from "./AudienceChart.jsx";

export default class AudienceInfo extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { data } = this.props;
    return (
      <div>
        <CompareLine audience={data.audiences[data.audiences.length - 1]} />
        <Divider hidden />
        <AudienceChart audiences={data.audiences} />
      </div>
    );
  }
}
