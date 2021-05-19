import React, { Component } from "react";
import styled from "styled-components";
import { Marker, Popup, FeatureGroup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PersonMetaButtons from "./PersonMetaButtons.jsx";
import PersonSummary from "./PersonSummary.jsx";
import PersonFormInfo from "./PersonFormInfo.jsx";

const icon =
  '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z"></path></svg>';

const PersonPopup = styled.div`
  width: 300px;
  .link {
    float: right;
    margin-top: 0.25rem;
  }
  .address {
    font-size: 0.9em;
    color: #666;
  }
  .person-meta-buttons {
    justify-content: flex-start;
    margin: 0 0 1rem;
    a {
      margin-right: 1rem;
      svg {
        margin-right: 0.5rem;
      }
    }
  }
  .person-summary {
    li {
      padding: 0;
    }
  }
`;

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
      html: `<i class="${classes.join(" ")}">${icon}</i>`,
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
  _handleMouseOver = person => ev => {
    const { onMouseOver } = this.props;
    onMouseOver && onMouseOver(person);
  };
  _handleMouseOut = person => ev => {
    const { onMouseOut } = this.props;
    onMouseOut && onMouseOut(person);
  };
  _handleClick = ev => {
    ev.target.openPopup();
  };
  render() {
    const { people } = this.props;
    if (people && people.length) {
      return (
        <FeatureGroup onAdd={this._handleAdd}>
          <MarkerClusterGroup>
            {people.map(person => (
              <Marker
                icon={PeopleMapLayer.icon(person)}
                key={person._id}
                position={person.location.coordinates}
                // onClick={this._handleClick}
                // onMouseOver={this._handleMouseOver(person)}
                // onMouseOut={this._handleMouseOut(person)}
              >
                <Popup>
                  <PersonPopup>
                    <a
                      className="link"
                      href={FlowRouter.path("App.people.detail", {
                        personId: person._id
                      })}
                    >
                      Profile
                    </a>
                    <h2>{person.name}</h2>
                    <PersonMetaButtons person={person} readOnly simple text />
                    <p className="address">
                      {person.location.formattedAddress}
                    </p>
                    <PersonSummary person={person} hideIfEmpty={true} />
                    <PersonFormInfo person={person} simple />
                  </PersonPopup>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </FeatureGroup>
      );
    } else {
      return null;
    }
  }
}
