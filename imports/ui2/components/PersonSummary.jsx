import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

const Container = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    margin: 0 0 0.75rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    &:last-child {
      margin: 0;
      padding: 0;
      border-bottom: 0;
    }
    svg {
      margin-right: 1rem;
    }
    span.empty {
      color: #999;
      font-style: italic;
    }
  }
`;

export default class PersonSummary extends Component {
  metaValue(key, defaultText) {
    const { person } = this.props;
    const value = person.campaignMeta ? get(person.campaignMeta, key) : false;
    if (value) {
      return <span>{value}</span>;
    } else {
      return (
        <span className="empty">
          {defaultText || "Informação não disponível"}
        </span>
      );
    }
  }
  tags() {
    const { person, tags } = this.props;
    const personTags = get(person, "campaignMeta.basic_info.tags");
    if (personTags && personTags.length && tags && tags.length) {
      return tags
        .filter(tag => personTags.indexOf(tag._id) !== -1)
        .map(tag => tag.name)
        .join(", ");
    } else {
      return <span className="empty">Não existem tags associadas</span>;
    }
  }
  render() {
    return (
      <Container>
        <li>
          <FontAwesomeIcon icon="envelope" /> {this.metaValue("contact.email")}
        </li>
        <li>
          <FontAwesomeIcon icon="phone" /> {this.metaValue("contact.cellphone")}
        </li>
        <li>
          <FontAwesomeIcon icon="tag" /> {this.tags()}
        </li>
      </Container>
    );
  }
}
