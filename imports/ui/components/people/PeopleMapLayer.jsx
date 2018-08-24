import React from "react";
import { Header } from "semantic-ui-react";
import { Marker, Popup, FeatureGroup } from "react-leaflet";
import PeopleCard from "/imports/ui/components/people/PeopleCard.jsx";

export default class PeopleMapLayer extends React.Component {
  constructor(props) {
    super(props);
  }
  static icon = L.divIcon({
    html: "<i class='user circle icon'></i>",
    iconSize: [20, 20],
    iconAnchor: [10, 0],
    popupAnchor: [0, -10],
    className: "people-icon"
  });
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
            <Marker
              icon={PeopleMapLayer.icon}
              key={person._id}
              position={person.location.coordinates}
            >
              <Popup>
                <PeopleCard person={person} />
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
