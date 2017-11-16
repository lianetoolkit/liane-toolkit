import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import LineChart from "/imports/ui/components/charts/LineChart.jsx";
import { Header, Divider, Segment } from "semantic-ui-react";
import _ from "underscore";

export default class AudienceGeoLocationChart extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }
  _getLabels() {
    const { audiences } = this.props;
    const labels = _.pluck(audiences, "fetch_date");
    return labels;
  }
  _getData() {
    const { audiences } = this.props;
    const data = [];
    _.each(audiences, audience => {
      data.push(audience.location_estimate);
    });
    return data;
  }

  render() {
    const { loading, geoLocationId, audiences } = this.props;
    const geoLocation = Geolocations.findOne(geoLocationId);
    return (
      <div>
        <Header as="h5">{geoLocation.name}</Header>
        {loading ? (
          ""
        ) : (
          <div>
            <LineChart
              data={this._getData()}
              labels={this._getLabels()}
              name="dale"
              title="% of success"
            />
          </div>
        )}
      </div>
    );
  }
}
