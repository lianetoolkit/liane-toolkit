import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import { userCan } from "/imports/ui2/utils/permissions";
import { alertStore } from "../containers/Alerts.jsx";
import TagSelect from "./TagSelect.jsx";
import CopyToClipboard from "./CopyToClipboard.jsx";

const messages = defineMessages({
  noData: {
    id: "app.people.profile.summary.no_data_label",
    defaultMessage: "Not registered",
  },
  noTags: {
    id: "app.people.profile.summary.no_tags_label",
    defaultMessage: "No tags assigned",
  },
  copy: {
    id: "app.people.profile.summary.copy_label",
    defaultMessage: "Copy",
  },
});

const Container = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  li {
    display: flex;
    flex: 1 1 auto;
    margin: 0 0 0.75rem;
    padding: 0 0.75rem 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    align-items: center;
    svg.svg-inline--fa {
      margin-right: 1rem;
    }
    span.empty {
      color: #999;
      font-style: italic;
    }
    a.copy {
      display: inline-block;
      color: #888 !important;
      margin: 0 0.5rem;
      &:hover,
      &:focus {
        color: #f60 !important;
      }
      svg {
        font-size: 0.8em;
        margin: 0;
      }
    }
    &.tags {
      flex: 1 1 100%;
      > div {
        width: 100%;
      }
    }
  }
  .select-search__menu {
    color: #333;
  }
  .select-search__control {
    width: 100%;
    background: rgba(255, 255, 255, 0.05) !important;
    color: #fff;
    .select-search__multi-value {
      background: rgba(0, 0, 0, 0.1);
    }
    .select-search__multi-value__label {
      color: #fff;
    }
    .select-search__value-container {
      padding: 0 0.5rem !important;
    }
    .select-search__indicator-separator {
      background: rgba(255, 255, 255, 0.05);
    }
    .select-search__input {
      color: #fff;
      input {
        margin: 0;
      }
    }
  }
`;

class PersonSummary extends Component {
  constructor(props) {
    super(props);
    this.state = { person: false, loaded: false };
  }
  componentDidMount() {
    this._fetch();
  }
  componentDidUpdate() {
    // ReactTooltip.rebuild();
  }
  value(key) {
    const person = this.state.person || this.props.person;
    return person.campaignMeta ? get(person.campaignMeta, key) : false;
  }
  getTags() {
    const { tags } = this.props;
    const person = this.state.person || this.props.person;
    const personTags = get(person, "campaignMeta.basic_info.tags");
    if (personTags && personTags.length && tags && tags.length) {
      return tags.filter((tag) => personTags.indexOf(tag._id) !== -1);
    }
    return [];
  }
  getTagsName() {
    return this.getTags().map((tag) => tag.name);
  }
  shouldHide(key) {
    const { person, hideIfEmpty } = this.props;

    if (!hideIfEmpty) return false;

    let should = hideIfEmpty == true || hideIfEmpty[key] == true;

    if (!should) return false;

    if (key == "tags") {
      return !this.getTags().length;
    } else {
      return !this.value(key);
    }
  }
  text(key, defaultText) {
    const { intl } = this.props;
    const value = this.value(key);
    if (value) {
      return <span>{value}</span>;
    } else {
      return (
        <span className="empty">
          {defaultText || intl.formatMessage(messages.noData)}
        </span>
      );
    }
  }
  tags() {
    const { intl } = this.props;
    const tags = this.getTagsName();
    if (tags.length) {
      return tags.join(", ");
    }
    return <span className="empty">{intl.formatMessage(messages.noTags)}</span>;
  }
  _fetch = () => {
    return new Promise((resolve, reject) => {
      const person = this.state.person || this.props.person;
      this.setState({ loading: true });
      Meteor.call("people.detail", { personId: person._id }, (err, res) => {
        this.setState({ loading: false });
        if (err) {
          alertStore.add(err);
          reject();
        } else {
          this.setState({
            person: res,
            loaded: true,
          });
          resolve(res);
        }
      });
    });
  };
  _handleTagChange = ({ target }) => {
    const person = this.state.person || this.props.person;
    Meteor.call(
      "people.updateTags",
      { personId: person._id, tags: target.value },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          this._fetch().then((person) => {
            this.props.onUpdate && this.props.onUpdate(person);
          });
        }
      }
    );
  };
  render() {
    const { intl } = this.props;
    const person = this.state.person || this.props.person;
    const email = this.value("contact.email");
    const phone = this.value("contact.cellphone");
    const instagram = this.value("social_networks.instagram");
    const twitter = this.value("social_networks.twitter");
    return (
      <>
        <Container className="person-summary">
          {!this.shouldHide("contact.email") ? (
            <li>
              <FontAwesomeIcon icon="envelope" /> {this.text("contact.email")}
              {email ? (
                <CopyToClipboard text={email} className="copy">
                  <FontAwesomeIcon
                    icon="copy"
                    data-tip={intl.formatMessage(messages.copy)}
                    data-for={`person-summary-${person._id}`}
                  />
                </CopyToClipboard>
              ) : null}
            </li>
          ) : null}
          {!this.shouldHide("contact.cellphone") ? (
            <li>
              <FontAwesomeIcon icon="phone" /> {this.text("contact.cellphone")}
              {phone ? (
                <CopyToClipboard text={phone} className="copy">
                  <FontAwesomeIcon
                    icon="copy"
                    data-tip={intl.formatMessage(messages.copy)}
                    data-for={`person-summary-${person._id}`}
                  />
                </CopyToClipboard>
              ) : null}
            </li>
          ) : null}
          {!this.shouldHide("social_networks.instagram") ? (
            <li>
              <FontAwesomeIcon icon={["fab", "instagram"]} />{" "}
              {this.text("social_networks.instagram")}
              {instagram ? (
                <CopyToClipboard text={instagram} className="copy">
                  <FontAwesomeIcon
                    icon="copy"
                    data-tip={intl.formatMessage(messages.copy)}
                    data-for={`person-summary-${person._id}`}
                  />
                </CopyToClipboard>
              ) : null}
            </li>
          ) : null}
          {!this.shouldHide("social_networks.twitter") ? (
            <li>
              <FontAwesomeIcon icon={["fab", "twitter"]} />{" "}
              {this.text("social_networks.twitter")}
              {twitter ? (
                <CopyToClipboard text={twitter} className="copy">
                  <FontAwesomeIcon
                    icon="copy"
                    data-tip={intl.formatMessage(messages.copy)}
                    data-for={`person-summary-${person._id}`}
                  />
                </CopyToClipboard>
              ) : null}
            </li>
          ) : null}
          {!this.shouldHide("tags") ? (
            <li className="tags">
              <FontAwesomeIcon icon="tag" />
              {userCan("categorize", "people") ? (
                <TagSelect
                  name="tags"
                  onChange={this._handleTagChange}
                  value={this.getTags().map((t) => t._id)}
                />
              ) : (
                this.tags()
              )}
            </li>
          ) : null}
        </Container>
        <ReactTooltip
          id={`person-summary-${person._id}`}
          place="top"
          effect="solid"
        />
      </>
    );
  }
}

PersonSummary.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonSummary);
