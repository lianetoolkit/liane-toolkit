import React from "react";
import { Header } from "semantic-ui-react";
import { Marker, Popup, TileLayer, LayerGroup, GeoJSON } from "react-leaflet";

export default class PeopleMapLayer extends React.Component {
  render() {
    const { people } = this.props;
    console.log(people);
    if (people && people.length) {
      return (
        <LayerGroup>
          {people.map(person => (
            <Marker key={person._id} position={person.location.coordinates}>
              <Popup>
                <Header>{person.name}</Header>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      );
    }
  }
}
