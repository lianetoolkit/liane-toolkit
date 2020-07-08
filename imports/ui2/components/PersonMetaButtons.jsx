import React from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClientStorage } from "meteor/ostrio:cstorage";
import styled, { css } from "styled-components";
import { alertStore } from "../containers/Alerts.jsx";

export const labels = defineMessages({
  supporter: {
    id: "app.people.category.supporter",
    defaultMessage: "Supporter",
  },
  volunteer: {
    id: "app.people.category.volunteer",
    defaultMessage: "Volunteer",
  },
  mobilizer: {
    id: "app.people.category.mobilizer",
    defaultMessage: "Mobilizer",
  },
  donor: {
    id: "app.people.category.donor",
    defaultMessage: "Donor",
  },
  influencer: {
    id: "app.people.category.influencer",
    defaultMessage: "Influencer",
  },
  voter: {
    id: "app.people.category.voter",
    defaultMessage: "Declared vote",
  },
  "non-voter": {
    id: "app.people.category.non_voter",
    defaultMessage: "Can't vote",
  },
  troll: {
    id: "app.people.category.troll",
    defaultMessage: "Troll",
  },
});

const Container = styled.div`
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes wiggle {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(10deg);
    }
    50% {
      transform: rotate(-10deg);
    }
    75% {
      transform: rotate(10deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
  font-size: 0.8em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  a.meta-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.125rem;
    color: #fff;
    border-radius: 100%;
    width: 15px;
    height: 15px;
    padding: 0.4rem;
    text-decoration: none;
    .loading {
      animation: rotate 2s linear infinite;
    }
    &.big {
      width: 40px;
      height: 40px;
      font-size: 1.8em;
    }
  }
  ${(props) =>
    props.vertical &&
    css`
      flex-direction: column;
      a.meta-icon {
        margin: 0 0 1rem;
      }
    `}
  ${(props) =>
    props.simple &&
    css`
      font-size: 1em;
      a.meta-icon {
        width: auto;
        height: auto;
        padding: 0;
      }
    `}
  ${(props) =>
    props.readOnly &&
    css`
      a.meta-icon {
        cursor: default;
        &:hover {
          box-shadow: none;
          opacity: 1 !important;
        }
      }
    `}
  ${(props) =>
    props.interactive &&
    css`
      a.meta-icon {
        transition: all 0.1s ease-in-out;
        transform-origin: 50% 100%;
        background: #fff;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
        position: relative;
        &:hover {
          z-index: 2;
          opacity: 1 !important;
          transform: scale(1.6);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
          svg {
            animation: wiggle 0.75s ease-in-out infinite;
          }
        }
        &:hover .loading,
        .loading {
          animation: rotate 2s linear infinite;
        }
      }
    `}
`;

class PersonMetaButtons extends React.Component {
  static keys = ["volunteer", "donor", "voter", "non-voter", "troll"];
  static colors = {
    supporter: "#7171fc",
    volunteer: "#ffa500",
    mobilizer: "#d5d500",
    donor: "#46dd46",
    influencer: "#f399cc",
    voter: "#31d5d5",
    "non-voter": "#f25ff2",
    troll: "#ff5656",
  };
  static labels = {
    supporter: "Supporter",
    volunteer: "Volunteer",
    mobilizer: "Mobilizer",
    donor: "Donor",
    influencer: "Influencer",
    voter: "Declared vote",
    "non-voter": "Cant't vote",
    troll: "Troll",
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: {},
    };
    this._handleClick = this._handleClick.bind(this);
  }
  getLabel = (key) => {
    const { intl } = this.props;
    return intl.formatMessage(labels[key]);
  };
  _handleClick(key) {
    let { person, readOnly, onChange } = this.props;
    if (readOnly) {
      return () => {};
    }
    if (person) {
      person.campaignMeta = person.campaignMeta || {};
      const personId = person.personId || person.__originalId || person._id;
      return (ev) => {
        this.setState({
          loading: {
            [key]: true,
          },
        });
        const data = {
          personId,
          metaKey: key,
          metaValue: person.campaignMeta[key] ? false : true,
        };
        Meteor.call("facebook.people.updatePersonMeta", data, (error) => {
          if (error) {
            alertStore.add(error);
          } else {
            if (onChange) {
              onChange(data);
            }
            person.campaignMeta[key] = data.metaValue;
          }
          this.setState({
            loading: {
              [key]: false,
            },
          });
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
        return "hand-holding-heart";
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
  _metaIconLabel(key) {
    return this.getLabel(key);
  }
  _metaIconColor(key) {
    return PersonMetaButtons.colors[key];
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
    const { person, size, readOnly, simple, text, vertical } = this.props;
    const { loading } = this.state;

    const campaignType = ClientStorage.get("campaignType");

    if (!campaignType.match(/electoral|mandate/)) {
      if (key.match(/voter|non-voter/)) {
        return null;
      }
    }

    const hasMeta = this._hasMeta(data, key);

    if (readOnly && !hasMeta) return null;

    const iconName = loading[key] ? "spinner" : this._metaIconName(key);
    const iconColor = this._metaIconColor(key);
    const iconLabel = this._metaIconLabel(key);

    let style = {};

    if (!readOnly) {
      style["cursor"] = "pointer";
      style["opacity"] = hasMeta ? 1 : 0.5;
    }

    let bottomOffset = "0.25rem";

    if (simple) {
      style["color"] = iconColor;
    } else {
      bottomOffset = "1.25rem";
      style["borderWidth"] = "1px";
      style["borderStyle"] = "solid";
      style["borderColor"] = "#ddd";
      style["color"] = iconColor;
      if (hasMeta) {
        style["color"] = "#333";
        style["backgroundColor"] = iconColor;
        style["borderColor"] = iconColor;
        style["borderColor"] = "rgba(0,0,0,0.5)";
      }
    }
    let tooltipId = "person-meta-buttons";
    if (person) {
      tooltipId += `-${person._id}`;
    }
    return (
      <a
        href="javascript:void(0);"
        className={`meta-icon ${size || ""}`}
        style={style}
        onClick={this._handleClick(key)}
        data-tip={!text ? this.getLabel(key) : null}
        data-for={tooltipId}
      >
        <FontAwesomeIcon
          icon={iconName}
          className={`${loading[key] ? "loading" : ""}`}
        />
        {text ? <span className="meta-text">{this.getLabel(key)}</span> : null}
      </a>
    );
  }
  render() {
    const { person, vertical, text, ...props } = this.props;
    let tooltipId = "person-meta-buttons";
    if (person) {
      tooltipId += `-${person._id}`;
    }
    return (
      <Container className="person-meta-buttons" {...props} vertical={vertical}>
        {this._metaButton(person ? person.campaignMeta : false, "volunteer")}
        {this._metaButton(person ? person.campaignMeta : false, "donor")}
        {this._metaButton(person ? person.campaignMeta : false, "voter")}
        {this._metaButton(person ? person.campaignMeta : false, "non-voter")}
        {this._metaButton(person ? person.campaignMeta : false, "troll")}
        {!text ? (
          <ReactTooltip
            id={tooltipId}
            place={vertical ? "top" : "bottom"}
            effect="solid"
          />
        ) : null}
      </Container>
    );
  }
}

PersonMetaButtons.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonMetaButtons);
