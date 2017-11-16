import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";

export default class AudiencesIndexTable extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  getRatio (audience) {
    const local = audience.estimate/audience.total;
    const location = audience.location_estimate/audience.location_total;
    const ratio = local/location;
    let prefix = '+';
    if(ratio < 0) {
      prefix = '';
    }
    return prefix + ratio.toFixed(2) + 'x';
  }

  render() {
    const { loading, currentUser, selector, hideHeader } = this.props;
    return (
      <SmartTable
        collection={FacebookAudiences}
        publication="audiences.byAccount"
        selector={selector}
        title="Audience"
        orderBy={{ field: "audienceCategoryId", ordering: -1 }}
        hideHeader={hideHeader}
        columns={[
          {
            label: "Category",
            data: "audienceCategoryId",
            render: fbAudience => {
              const category = AudienceCategories.findOne(
                fbAudience.audienceCategoryId
              );
              return <b>{category.title}</b>;
            }
          },
          {
            label: "Location",
            data: "geoLocationId",
            render: fbAudience => {
              const geoLocation = Geolocations.findOne(
                fbAudience.geoLocationId
              );
              return <b>{geoLocation.name}</b>;
            }
          },
          {
            label: "fetch_date",
            data: "fetch_date"
          },
          {
            label: "Ratio",
            data: "ratio",
            render: fbAudience => {
              return <strong>{this.getRatio(fbAudience)}</strong>;
            }
          },
          {
            label: "estimate",
            data: "estimate"
          },
          {
            label: "total",
            data: "total"
          },
          {
            label: "Location estimate",
            data: "location_estimate"
          },
          {
            label: "location_total",
            data: "location_total"
          }
        ]}
      />
    );
  }
}
