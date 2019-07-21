import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import { getFormUrl } from "../utils/people";

import CopyToClipboard from "./CopyToClipboard.jsx";

const Container = styled.div`
  a {
    display: inline-block;
    margin: 0 0.3rem;
    opacity: 0.2;
    &.active {
      opacity: 1;
      &:hover,
      &:focus {
        color: #f60;
      }
    }
  }
`;

export default class PersonContactIcons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false
    };
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }
  getMeta(key) {
    const { person } = this.props;
    return person.campaignMeta && get(person.campaignMeta, key);
  }
  getLabelText(key) {
    const { person } = this.props;
    const data = get(person, `campaignMeta.${key}`);
    if (data) {
      return data;
    }
    return "Not available";
  }
  filledForm() {
    const { person } = this.props;
    return person.filledForm;
  }
  _handleClick = (ev, fade) => {
    this.setState({
      copied: true
    });
    fade();
  };
  _handleMouseLeave = () => {
    this.setState({
      copied: false
    });
  };
  render() {
    const { person } = this.props;
    const { copied } = this.state;
    const email = this.getMeta("contact.email");
    const phone = this.getMeta("contact.cellphone");
    const form = this.filledForm();
    if (person) {
      return (
        <Container>
          <CopyToClipboard
            disabled={!email}
            text={email}
            className={email ? "active" : ""}
            data-tip={email ? `${email} (copy)` : null}
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="envelope" />
          </CopyToClipboard>
          <CopyToClipboard
            disabled={!phone}
            text={phone}
            className={phone ? "active" : ""}
            data-tip={phone ? `${phone} (copy)` : null}
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="phone" />
          </CopyToClipboard>
          <CopyToClipboard
            text={getFormUrl(person.formId)}
            className={form ? "active" : ""}
            data-tip={
              form
                ? "Filled the form (copy link)"
                : "Did not filled the form (copy link)"
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="align-left" />
          </CopyToClipboard>
          <ReactTooltip
            id={`person-contact-icons-${person._id}`}
            place="top"
            effect="solid"
          />
        </Container>
      );
    } else {
      return null;
    }
  }
}
