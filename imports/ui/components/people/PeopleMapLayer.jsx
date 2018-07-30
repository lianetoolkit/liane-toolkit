import React from "react";
import { Header } from "semantic-ui-react";
import { Marker, Popup, FeatureGroup } from "react-leaflet";

export default class PeopleMapLayer extends React.Component {
  constructor(props) {
    super(props);
  }
  _handleAdd = ev => {
    const { onBounds } = this.props;
    if (onBounds) {
      onBounds(ev.target.getBounds());
    }
  };
  render() {
    const { people } = this.props;
    if (people && people.length) {
      return (
        <FeatureGroup onAdd={this._handleAdd}>
          {people.map(person => (
            <Marker key={person._id} position={person.location.coordinates}>
              <Popup>
                <Header>{person.name}</Header>
              </Popup>
            </Marker>
          ))}
        </FeatureGroup>
      );
    } else {
      return null;
    }
  }
}
