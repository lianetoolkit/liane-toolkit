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
  }
  render() {
    const {
      loading,
      audienceCategories,
      context,
      campaignId,
      facebookAccountId
    } = this.props;
    return (
      <div>
        {loading ? (
          ""
        ) : (
          <div>
            {audienceCategories.map(category => {
              return (
                <Segment basic key={category._id}>
                  <Header as="h4" dividing>
                    {category.title}
                  </Header>
                  {context.geolocations.map((geolocationId, index) => {
                    return (
                      <AudienceGeoLocationChartContainer
                        key={index}
                        campaignId={campaignId}
                        geolocationId={geolocationId}
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
