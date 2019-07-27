import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import { getFormUrl } from "../utils/people";

import CopyToClipboard from "./CopyToClipboard.jsx";

const messages = defineMessages({
  notAvailable: {
    id: "app.people.contact_icons.not_available",
    defaultMessage: "Not available"
  },
  copy: {
    id: "app.people.contact_icons.data_copy",
    defaultMessage: "{data} (copy)"
  },
  filledForm: {
    id: "app.people.contact_icons.filled_form",
    defaultMessage: "Filled the form (copy link)"
  },
  notFilledForm: {
    id: "app.people.contact_icons.not_filled_form",
    defaultMessage: "Did not filled the form (copy link)"
  }
});

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

class PersonContactIcons extends Component {
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
    const { intl, person } = this.props;
    const data = get(person, `campaignMeta.${key}`);
    if (data) {
      return data;
    }
    return intl.formatMessage(messages.notAvailable);
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
    const { intl, person } = this.props;
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
            data-tip={
              email ? intl.formatMessage(messages.copy, { data: email }) : null
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="envelope" />
          </CopyToClipboard>
          <CopyToClipboard
            disabled={!phone}
            text={phone}
            className={phone ? "active" : ""}
            data-tip={
              phone ? intl.formatMessage(messages.copy, { data: phone }) : null
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="phone" />
          </CopyToClipboard>
          <CopyToClipboard
            text={getFormUrl(person.formId)}
            className={form ? "active" : ""}
            data-tip={
              form
                ? intl.formatMessage(messages.filledForm)
                : intl.formatMessage(messages.notFilledForm)
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

PersonContactIcons.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(PersonContactIcons);
