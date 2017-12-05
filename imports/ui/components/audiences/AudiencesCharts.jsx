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
      facebookAccountId
    } = this.props;
    console.log(audienceCategories);
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
