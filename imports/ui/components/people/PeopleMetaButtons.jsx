import React from "react";
import { Popup, Icon } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

export default class PeopleMetaButtons extends React.Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }
  _handleClick(key) {
    let { person } = this.props;
    person.campaignMeta = person.campaignMeta || {};
    const personId = typeof person._id == 'string' ? person._id : person._id._str;
    return ev => {
      const data = {
        personId,
        metaKey: key,
        metaValue: person.campaignMeta[key] ? false : true
      };
      Meteor.call("facebook.people.updatePersonMeta", data, error => {
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Person updated successfully");
        }
      });
    };
  }
  _hasMeta(data = {}, key) {
    return !!data[key];
  }
  _metaIconName(key) {
    switch (key) {
      case "influencer":
        return "certificate";
      case "voteIntent":
        return "thumbs up";
      case "starred":
        return "star";
      case "troll":
        return "dont";
    }
  }
  _metaIconColor(key) {
    switch (key) {
      case "influencer":
        return "green";
      case "voteIntent":
        return "blue";
      case "starred":
        return "yellow";
      case "troll":
        return "red";
    }
  }
  _metaIconLabel(key) {
    switch (key) {
      case "influencer":
        return "This person is an influencer";
      case "voteIntent":
        return "This person will vote for you";
      case "starred":
        return "Star this person";
      case "troll":
        return "This person is a troll";
    }
  }
  _metaButton(data = {}, key) {
    const iconName = this._metaIconName(key);
    const iconColor = this._metaIconColor(key);
    const iconLabel = this._metaIconLabel(key);
    const hasMeta = this._hasMeta(data, key);
    const style = {
      opacity: hasMeta ? 1 : 0.2
    };
    return (
      <Popup
        trigger={
          <Icon
            color={iconColor}
            size="large"
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
    const { person } = this.props;
    return (
      <span>
        {this._metaButton(person.campaignMeta, "influencer")}
        {this._metaButton(person.campaignMeta, "starred")}
        {this._metaButton(person.campaignMeta, "voteIntent")}
        {this._metaButton(person.campaignMeta, "troll")}
      </span>
    );
  }
}
