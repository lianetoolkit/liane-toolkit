import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

const Container = styled.span`
  svg {
    font-size: 0.8em;
    color: #ccc;
    margin-right: 0.5rem;
  }
  .tag-item {
    background: #f0f0f0;
    border-radius: 7px;
    padding: 0.1rem 0.5rem;
    margin-right: 0.25rem;
  }
`;

export default class PersonTags extends Component {
  getTags() {
    const { person, tags } = this.props;
    if (!person) return [];
    const personTags = get(person, "campaignMeta.basic_info.tags");
    if (personTags && personTags.length && tags && tags.length) {
      return tags
        .filter(tag => personTags.indexOf(tag._id) !== -1)
        .map(tag => tag.name);
    }
    return [];
  }
  render() {
    const tags = this.getTags();
    if (!tags.length) return null;
    return (
      <Container className="person-tags">
        <FontAwesomeIcon icon="tag" />
        {tags.map(tag => (
          <span key={tag} className="tag-item">
            {tag}
          </span>
        ))}
      </Container>
    );
  }
}
