import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled, { css } from "styled-components";
import { alertStore } from "../containers/Alerts.jsx";

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
    width: 15px;
    border-radius: 100%;
    color: #fff;
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

const messages = defineMessages({
  label: {
    id: "app.people.starred_label",
    defaultMessage: "Important",
  },
});

class PersonStarredButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this._handleClick = this._handleClick.bind(this);
  }
  _handleClick = () => {
    let { person, readOnly, onChange } = this.props;
    if (readOnly) {
      return () => {};
    }
    if (person) {
      person.campaignMeta = person.campaignMeta || {};
      const personId = person.personId || person.__originalId || person._id;
      return (ev) => {
        this.setState({
          loading: true,
        });
        const data = {
          personId,
          metaKey: "starred",
          metaValue: person.campaignMeta["starred"] ? false : true,
        };
        Meteor.call("facebook.people.updatePersonMeta", data, (error) => {
          if (error) {
            alertStore.add(error);
          } else {
            if (onChange) {
              onChange(data);
            }
            person.campaignMeta["starred"] = data.metaValue;
          }
          this.setState({
            loading: false,
          });
        });
      };
    } else {
      return () => {
        onChange(key);
      };
    }
  };
  _isStarred = (data = {}) => {
    const { active } = this.props;
    return (active && active["starred"]) || !!data["starred"];
  };
  _metaButton(data = {}, key) {
    const { intl, person, size, readOnly, simple, text } = this.props;
    const { loading } = this.state;

    const isStarred = this._isStarred(data);

    if (readOnly && !isStarred) return null;

    const iconName = loading ? "spinner" : "star";
    const iconColor = "#330066";

    let style = {};

    if (!readOnly) {
      style["cursor"] = "pointer";
      style["opacity"] = isStarred ? 1 : 0.2;
    }

    let bottomOffset = "0.25rem";

    if (simple) {
      style["color"] = iconColor;
    } else {
      bottomOffset = "1.25rem";
      style["color"] = iconColor;
    }
    let tooltipId = "person-starred-button";
    if (person) {
      tooltipId += `-${person._id}`;
    }
    const label = intl.formatMessage(messages.label);
    return (
      <a
        href="javascript:void(0);"
        className={`meta-icon ${size || ""}`}
        style={style}
        onClick={this._handleClick(key)}
        data-tip={!text ? label : null}
        data-for={tooltipId}
      >
        <FontAwesomeIcon
          icon={iconName}
          className={`${loading ? "loading" : ""}`}
        />
        {text ? <span className="meta-text">{label}</span> : null}
      </a>
    );
  }
  render() {
    const { person, text, ...props } = this.props;
    let tooltipId = "person-starred-button";
    if (person) {
      tooltipId += `-${person._id}`;
    }
    return (
      <Container className="person-meta-buttons" {...props}>
        {this._metaButton(person ? person.campaignMeta : false, "starred")}
        {!text ? (
          <ReactTooltip id={tooltipId} place="bottom" effect="solid" />
        ) : null}
      </Container>
    );
  }
}

PersonStarredButton.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonStarredButton);
