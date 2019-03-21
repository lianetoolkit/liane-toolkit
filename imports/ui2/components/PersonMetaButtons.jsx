import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled, { css } from "styled-components";

const Container = styled.div`
  font-size: 0.8em;
  text-align: center;
  a.meta-icon {
    display: inline-block;
    margin: 0 0.25rem;
    color: #fff;
    border-radius: 100%;
    width: 15px;
    height: 15px;
    padding: 0.4rem;
    &:hover {
      opacity: 0.7 !important;
    }
  }
  ${props =>
    props.vertical &&
    css`
      a.meta-icon {
        display: block;
        margin: 0 0 1rem;
      }
    `}
  ${props =>
    props.simple &&
    css`
      font-size: 1em;
      a.meta-icon {
        width: auto;
        height: auto;
        padding: 0;
      }
    `}
  ${props =>
    props.readOnly &&
    css`
      a.meta-icon {
        cursor: default;
        &:hover {
          opacity: 1 !important;
        }
      }
    `}
`;

export default class PersonMetaButtons extends React.Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }
  _handleClick(key) {
    let { person, readOnly, onChange } = this.props;
    if (readOnly) {
      return () => {};
    }
    if (person) {
      person.campaignMeta = person.campaignMeta || {};
      const personId = person.personId || person.__originalId || person._id;
      return ev => {
        const data = {
          personId,
          metaKey: key,
          metaValue: person.campaignMeta[key] ? false : true
        };
        Meteor.call("facebook.people.updatePersonMeta", data, error => {
          if (error) {
            console.log(error);
          } else {
            if (onChange) {
              onChange(data);
            }
            person.campaignMeta[key] = data.metaValue;
            // Alerts.success("Person updated successfully");
          }
        });
      };
    } else {
      return () => {
        onChange(key);
      };
    }
  }
  _hasMeta(data = {}, key) {
    const { active } = this.props;
    return (active && active[key]) || !!data[key];
  }
  _metaIconName(key) {
    switch (key) {
      case "supporter":
        return "star";
      case "volunteer":
        return "hand-point-up";
      case "mobilizer":
        return "users";
      case "donor":
        return "money-bill";
      case "influencer":
        return "certificate";
      case "voter":
        return "thumbs-up";
      case "non-voter":
        return "calendar-times";
      case "troll":
        return "ban";
    }
  }
  _metaIconColor(key) {
    switch (key) {
      case "supporter":
        return "blue";
      case "volunteer":
        return "orange";
      case "mobilizer":
        return "yellow";
      case "donor":
        return "green";
      case "influencer":
        return "pink";
      case "voter":
        return "teal";
      case "non-voter":
        return "purple";
      case "troll":
        return "red";
    }
  }
  _metaIconLabel(key) {
    switch (key) {
      case "supporter":
        return "Up for sharing online content";
      case "volunteer":
        return "Willing to work on one-off tasks";
      case "mobilizer":
        return "Can take bigger responsibilities";
      case "donor":
        return "Donated or potential donors";
      case "influencer":
        return "Has a lot of followers";
      case "voter":
        return "Will vote for you";
      case "non-voter":
        return "Can't vote for you";
      case "troll":
        return "Not waste time responding";
    }
  }
  _metaButton(data = {}, key) {
    const { size, readOnly, simple } = this.props;

    const hasMeta = this._hasMeta(data, key);

    if (readOnly && !hasMeta) return null;

    const iconName = this._metaIconName(key);
    const iconColor = this._metaIconColor(key);
    const iconLabel = this._metaIconLabel(key);

    let style = {};

    if (!readOnly) {
      style["cursor"] = "pointer";
      style["opacity"] = hasMeta ? 1 : 0.2;
    }

    if (simple) {
      style["color"] = iconColor;
    } else {
      style["backgroundColor"] = iconColor;
    }

    return (
      <a
        href="javascript:void(0);"
        className="meta-icon"
        style={style}
        onClick={this._handleClick(key)}
      >
        <FontAwesomeIcon icon={iconName} />
      </a>
    );
    return (
      <Popup
        trigger={
          <Icon
            color={iconColor}
            size={size}
            name={iconName}
            style={style}
            onClick={this._handleClick(key)}
          />
        }
        content={iconLabel}
      />
    );
  }
  render() {
    const { person, ...props } = this.props;
    return (
      <Container {...props}>
        {this._metaButton(person ? person.campaignMeta : false, "supporter")}
        {this._metaButton(person ? person.campaignMeta : false, "volunteer")}
        {this._metaButton(person ? person.campaignMeta : false, "mobilizer")}
        {this._metaButton(person ? person.campaignMeta : false, "donor")}
        {this._metaButton(person ? person.campaignMeta : false, "influencer")}
        {this._metaButton(person ? person.campaignMeta : false, "voter")}
        {this._metaButton(person ? person.campaignMeta : false, "non-voter")}
        {this._metaButton(person ? person.campaignMeta : false, "troll")}
      </Container>
    );
  }
}
