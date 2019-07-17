import React, { Component } from "react";
import { Marker, Popup, FeatureGroup } from "react-leaflet";

export default class PeopleMapLayer extends Component {
  constructor(props) {
    super(props);
  }
  static icon = person => {
    let classes = ["user", "circle", "icon"];
    if (person.campaignMeta && person.campaignMeta.mobilizer) {
      classes.push("yellow-bg");
    }
    return L.divIcon({
      html: `<i class="${classes.join(" ")}"></i>`,
      iconSize: [20, 20],
      iconAnchor: [10, 0],
      popupAnchor: [0, -10],
      className: "people-icon"
    });
  };
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
              icon={PeopleMapLayer.icon(person)}
              key={person._id}
              position={person.location.coordinates}
            >
              <Popup>
                <h2>{person.name}</h2>
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
