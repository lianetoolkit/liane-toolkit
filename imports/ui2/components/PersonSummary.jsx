import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import CopyToClipboard from "./CopyToClipboard.jsx";

const Container = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  li {
    flex: 1 1 auto;
    margin: 0 0 0.75rem;
    padding: 0 0.75rem 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    svg {
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
  }
`;

export default class PersonSummary extends Component {
  value(key) {
    const { person } = this.props;
    return person.campaignMeta ? get(person.campaignMeta, key) : false;
  }
  getTags() {
    const { person, tags } = this.props;
    const personTags = get(person, "campaignMeta.basic_info.tags");
    if (personTags && personTags.length && tags && tags.length) {
      return tags
        .filter(tag => personTags.indexOf(tag._id) !== -1)
        .map(tag => tag.name);
    }
    return [];
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
    const value = this.value(key);
    if (value) {
      return <span>{value}</span>;
    } else {
      return (
        <span className="empty">
          {defaultText || "Não cadastrado"}
        </span>
      );
    }
  }
  tags() {
    const tags = this.getTags();
    if (tags.length) {
      return tags.join(", ");
    }
    return <span className="empty">Não existem tags associadas</span>;
  }
  render() {
    const { person } = this.props;
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
                    data-tip="Copiar"
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
                    data-tip="Copiar"
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
                    data-tip="Copiar"
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
                    data-tip="Copiar"
                    data-for={`person-summary-${person._id}`}
                  />
                </CopyToClipboard>
              ) : null}
            </li>
          ) : null}
          {!this.shouldHide("tags") ? (
            <li>
              <FontAwesomeIcon icon="tag" /> {this.tags()}
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
