import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import CopyToClipboard from "./CopyToClipboard.jsx";

const messages = defineMessages({
  copy: {
    id: "app.people.contact_icons.data_copy",
    defaultMessage: "{data} (copy)",
  },
});

const Container = styled.div`
  a {
    display: inline-block;
    margin: 0 0.1rem;
    opacity: 0.2;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    &.active {
      opacity: 1;
      &:hover,
      &:focus {
        color: #f60;
      }
      &.whatsapp {
        border-radius: 100%;
        color: #fff;
        background: #25d366;
      }
    }
  }
`;

class PersonSocialNetworkIcons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
    };
  }
  getMeta(key) {
    const { person } = this.props;
    switch(key) {
      case 'social_networks.facebook':
        return person.facebookId.match(/^[0-9]*$/) && person.facebookId;
      default:
        return person.campaignMeta && get(person.campaignMeta, key);
    }
  }
  render() {
    const { intl, person } = this.props;
    const { copied } = this.state;
    if (person) {
      const facebook = this.getMeta("social_networks.facebook");
      const instagram = this.getMeta("social_networks.instagram");
      const twitter = this.getMeta("social_networks.twitter");
      console.log('facebook: ' + facebook);
      console.log('instagram: ' + instagram);
      console.log('twitter: ' + twitter);
      return (
        <Container>
          <CopyToClipboard
            disabled={!facebook}
            text={facebook}
            className={facebook ? "active" : ""}
            data-tip={
              facebook ? intl.formatMessage(messages.copy, { data: facebook }) : null
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon={["fab", "facebook-square"]} />
          </CopyToClipboard>
          <CopyToClipboard
            disabled={!instagram}
            text={instagram}
            className={instagram ? "active" : ""}
            data-tip={
              instagram ? intl.formatMessage(messages.copy, { data: instagram }) : null
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon={["fab", "instagram"]} />
          </CopyToClipboard>
          <CopyToClipboard
            disabled={!twitter}
            text={twitter}
            className={twitter ? "active" : ""}
            data-tip={
              twitter ? intl.formatMessage(messages.copy, { data: twitter }) : null
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon={["fab", "twitter"]} />
          </CopyToClipboard>
        </Container>
      );
    } else {
      return null;
    }
  }
}

PersonSocialNetworkIcons.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonSocialNetworkIcons);
