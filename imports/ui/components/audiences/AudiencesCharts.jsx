import React from "react";
import AudienceGeoLocationChartContainer from "/imports/ui/containers/audiences/AudienceGeoLocationChartContainer.jsx";
import {
  Header,
  Container,
  Button,
  Divider,
  Segment,
  Tab
} from "semantic-ui-react";

export default class AudiencesCharts extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }
  render() {
    const {
      loading,
      audiencesCategories,
      context,
      facebookAccountId
    } = this.props;
    return (
      <div>
        {loading ? (
          ""
        ) : (
          <div>
            {audiencesCategories.map(category => {
              return (
                <Segment basic key={category._id}>
                  <Header as="h4" dividing>
                    {category.title}
                  </Header>
                  {context.geolocations.map((geoLocationId, index) => {
                    return (
                      <AudienceGeoLocationChartContainer
                        key={index}
                        geoLocationId={geoLocationId}
                        audienceCategoryId={category._id}
                        facebookAccountId={facebookAccountId}
                      />
                    );
                  })}
                </Segment>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
